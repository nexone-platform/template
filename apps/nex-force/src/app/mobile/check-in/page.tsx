"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { attendanceService } from "@/services/attendance.service";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { Clock, MapPin, CheckCircle, RotateCcw } from "lucide-react";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { getApiErrorMessage } from "@/lib/api-error";

const PUNCH_STATUS = {
    PUNCH_IN: "punch-in",
    PUNCH_OUT: "punch-out",
    START_BREAK: "start-break",
    END_BREAK: "end-break",
    REVERT: "revert-punch-out"
};

export default function MobileCheckInPage() {
    const router = useRouter();
    const [empId, setEmpId] = useState<number | null>(null);
    const [userProfile, setUserProfile] = useState("");
    
    const [checkinData, setCheckinData] = useState<any>(null);
    const [buttonStatus, setButtonStatus] = useState<string>("");
    const [displayTime, setDisplayTime] = useState("00:00:00");
    const [loading, setLoading] = useState(false);
    
    const timerInterval = useRef<NodeJS.Timeout | null>(null);

    const formatDurationHuman = useCallback((ms: number) => {
        const totalMinutes = Math.floor(ms / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h 0m`;
        return `${minutes}m`;
    }, []);

    const calculateDiff = useCallback((start: string | Date, end: string | Date) => {
        const diff = new Date(end).getTime() - new Date(start).getTime();
        return formatDurationHuman(diff);
    }, [formatDurationHuman]);

    const startTimer = useCallback((checkInTime: string) => {
        const checkIn = new Date(checkInTime).getTime();
        if (timerInterval.current) clearInterval(timerInterval.current);
        
        timerInterval.current = setInterval(() => {
            const now = Date.now();
            setDisplayTime(formatDurationHuman(now - checkIn));
        }, 1000);
    }, [formatDurationHuman]);

    const clearTimer = useCallback(() => {
        if (timerInterval.current) {
            clearInterval(timerInterval.current);
        }
    }, []);

    const getCheckinData = useCallback(async (employeeId: number) => {
        try {
            const response: any = await attendanceService.getCheckinData(employeeId);
            setCheckinData(response);

            if (response?.checkInTime) {
                if (response?.checkOutTime) {
                    setDisplayTime(calculateDiff(response.checkInTime, response.checkOutTime));
                } else {
                    startTimer(response.checkInTime);
                }
            }
        } catch (error) {
            console.error("Failed to load checkin data:", error);
        }
    }, [calculateDiff, startTimer]);

    const getCheckInStatus = useCallback(async (employeeId: number) => {
        try {
            const response: any = await attendanceService.checkStatus(employeeId);
            setButtonStatus(response.status);
        } catch (error) {
            console.error("Failed to load status:", error);
        }
    }, []);

    useEffect(() => {
        const storedEmpId = localStorage.getItem("employeeId");
        const storedUsername = localStorage.getItem("username");
        
        if (!storedEmpId) {
            router.push(ROUTES.registerLine);
            return;
        }

        const id = Number(storedEmpId);
        setEmpId(id);
        setUserProfile(storedUsername || "MobileUser");

        getCheckInStatus(id);
        getCheckinData(id);

        return () => clearTimer();
    }, [router, getCheckInStatus, getCheckinData, clearTimer]);

    const handleCheckIn = async (status: string) => {
        if (!empId) return;

        if (!navigator.geolocation) {
            Swal.fire({
                title: 'Browser Not Supported',
                text: 'Your device does not support GPS usage.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const currentLat = position.coords.latitude;
                const currentLon = position.coords.longitude;

                try {
                    const response: any = await attendanceService.checkIn(
                        empId, currentLat, currentLon, userProfile, status
                    );

                    Swal.fire({
                        title: 'Success!',
                        text: response.message || "Successfully recorded your time.",
                        icon: 'success',
                        confirmButtonText: 'OK',
                    }).then(() => {
                        window.location.reload();
                    });
                } catch (error) {
                    Swal.fire({
                        title: 'Error!',
                        text: getApiErrorMessage(error, "Failed to record time."),
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                setLoading(false);
                let message = '';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Please allow Location Permission.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Unable to detect location. Please try again.';
                        break;
                    case error.TIMEOUT:
                        message = 'Connection timeout. Please try again.';
                        break;
                    default:
                        message = 'An error occurred while finding your location.';
                }

                Swal.fire({
                    title: 'GPS Error',
                    text: message,
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const confirmRevert = () => {
        Swal.fire({
            title: 'Revert Check Out?',
            text: 'Are you sure you want to revert Check Out?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, revert it',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                handleCheckIn(PUNCH_STATUS.REVERT);
            }
        });
    };

    const todayDateStr = format(new Date(), "dd/MM/yyyy");

    return (
        <div className="flex flex-col pt-10 px-4 pb-4">
            <div className="w-full max-w-md mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Check In</h2>
                    <p className="text-gray-500">Record your daily work time</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-nv-violet" />
                            Timesheet
                        </h3>
                        <span className="text-sm text-gray-500 font-medium">{todayDateStr}</span>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                                <h6 className="text-xs text-gray-500 font-medium mb-1">Punch In At</h6>
                                <p className="text-sm font-semibold text-gray-800">
                                    {checkinData?.checkInTime ? format(new Date(checkinData.checkInTime), "dd/MM/yyyy hh:mm a") : "N/A"}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                                <h6 className="text-xs text-gray-500 font-medium mb-1">Punch Out At</h6>
                                <p className="text-sm font-semibold text-gray-800">
                                    {checkinData?.checkOutTime ? format(new Date(checkinData.checkOutTime), "dd/MM/yyyy hh:mm a") : "N/A"}
                                </p>
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center bg-violet-50 text-nv-violet border border-violet-100 rounded-full py-4 px-10 shadow-inner">
                                <span className="text-4xl font-bold font-mono tracking-wider">{displayTime}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-3 font-medium uppercase tracking-widest">Total Working Hours</p>
                        </div>

                        <div className="space-y-4">
                            {buttonStatus === PUNCH_STATUS.PUNCH_IN && (
                                <button onClick={() => handleCheckIn(PUNCH_STATUS.PUNCH_IN)} disabled={loading} className="w-full flex justify-center items-center gap-2 py-4 bg-nv-violet hover:bg-violet-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-[0.98]">
                                    <MapPin className="w-5 h-5" /> {loading ? "Detecting GPS..." : "Punch In"}
                                </button>
                            )}

                            {buttonStatus === PUNCH_STATUS.PUNCH_OUT && (
                                <button onClick={() => handleCheckIn(PUNCH_STATUS.PUNCH_OUT)} disabled={loading} className="w-full flex justify-center items-center gap-2 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all shadow-md active:scale-[0.98]">
                                    <CheckCircle className="w-5 h-5" /> {loading ? "Processing..." : "Punch Out"}
                                </button>
                            )}

                            {buttonStatus === 'completed' && (
                                <div className="space-y-3">
                                    <button disabled className="w-full flex justify-center items-center gap-2 py-4 bg-green-500 text-white font-semibold rounded-xl shadow-md cursor-not-allowed opacity-90">
                                        <CheckCircle className="w-5 h-5" /> Punch Completed
                                    </button>
                                    
                                    <button onClick={confirmRevert} className="w-full flex justify-center items-center gap-2 py-3 bg-white border border-red-200 text-red-500 hover:bg-red-50 font-medium rounded-xl transition-colors">
                                        <RotateCcw className="w-4 h-4" /> Revert Punch Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="text-center text-xs text-gray-400 font-medium">
                    Please ensure your GPS is enabled before check-in.
                </div>
            </div>
        </div>
    );
}
