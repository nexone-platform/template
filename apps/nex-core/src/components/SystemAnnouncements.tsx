import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Check, Megaphone, Users, Building2, UserCircle, ShieldCheck, Send, Info, AlertTriangle, CheckCircle, Clock, CheckCircle2 } from 'lucide-react';
import { coreAnnouncementApi, Announcement } from '../services/api';
import { useLanguage, useSystemConfig } from '@nexone/ui';
import { format } from 'date-fns';

export default function SystemAnnouncements() {
  const { lang } = useLanguage();
  const { configs } = useSystemConfig();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: '',
    message: '',
    targetType: 'ALL',
    targetIds: [],
    isActive: true,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ทั้งหมด');

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await coreAnnouncementApi.getAll();
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditingId(announcement.id);
      setFormData({
        title: announcement.title,
        message: announcement.message,
        targetType: announcement.targetType,
        targetIds: announcement.targetIds || [],
        isActive: announcement.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        message: '',
        targetType: 'ALL',
        targetIds: [],
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        targetIds: typeof formData.targetIds === 'string' ? formData.targetIds.split(',').map((s: string) => s.trim()) : formData.targetIds
      };

      if (editingId) {
        await coreAnnouncementApi.update(editingId, payload);
      } else {
        await coreAnnouncementApi.create(payload);
      }
      fetchAnnouncements();
      closeModal();
    } catch (err) {
      console.error('Failed to save announcement:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(lang === 'th' ? 'คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้?' : 'Are you sure you want to delete this announcement?')) {
      try {
        await coreAnnouncementApi.remove(id);
        fetchAnnouncements();
      } catch (err) {
        console.error('Failed to delete announcement:', err);
      }
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await coreAnnouncementApi.update(id, { isActive: !currentStatus });
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTargetIcon = (type: string) => {
    switch(type) {
      case 'ALL': return <Users className="w-4 h-4 text-blue-500" />;
      case 'DEPARTMENT': return <Building2 className="w-4 h-4 text-indigo-500" />;
      case 'ROLE': return <ShieldCheck className="w-4 h-4 text-purple-500" />;
      case 'USER': return <UserCircle className="w-4 h-4 text-pink-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTargetLabel = (type: string) => {
    switch(type) {
      case 'ALL': return lang === 'th' ? 'ทุกคนในระบบ' : 'All Users';
      case 'DEPARTMENT': return lang === 'th' ? 'เฉพาะแผนก' : 'Department';
      case 'ROLE': return lang === 'th' ? 'เฉพาะบทบาท/ตำแหน่ง' : 'Role/Position';
      case 'USER': return lang === 'th' ? 'เฉพาะผู้ใช้งาน' : 'Specific Users';
      default: return type;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-600" />
            {lang === 'th' ? 'ระบบประกาศข่าวสาร' : 'System Announcements'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {lang === 'th' ? 'จัดการและส่งประกาศไปยังกลุ่มผู้ใช้งานต่างๆ' : 'Manage and send announcements to target groups'}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {lang === 'th' ? 'สร้างประกาศใหม่' : 'New Announcement'}
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between border-b border-gray-200">
        <div className="flex gap-8">
          {['ทั้งหมด', 'ประกาศ (Broadcast)', 'แจ้งเตือนระบบ (Alert)', 'ข้อความทั่วไป'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold transition-colors relative ${
                activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
        <div className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={lang === 'th' ? 'ค้นหาประกาศ/ผู้รับ...' : 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-[13px] border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">{lang === 'th' ? 'รหัส / ประเภท' : 'Code / Type'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'th' ? 'หัวข้อประกาศ (Title)' : 'Title'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'th' ? 'ผู้รับ (Target)' : 'Target'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'th' ? 'อัตราการอ่าน' : 'Read Rate'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'th' ? 'สถานะ' : 'Status'}</th>
                <th className="px-6 py-4 font-semibold text-right">{lang === 'th' ? 'จัดการ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {lang === 'th' ? 'กำลังโหลด...' : 'Loading...'}
                  </td>
                </tr>
              ) : filteredAnnouncements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {lang === 'th' ? 'ไม่พบข้อมูลประกาศ' : 'No announcements found'}
                  </td>
                </tr>
              ) : (
                filteredAnnouncements.map((item, index) => {
                  const isBroadcast = item.targetType === 'ALL';
                  const codeNumber = (1004 - index).toString().padStart(4, '0');
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isBroadcast ? 'bg-blue-50 text-blue-500' : 'bg-yellow-50 text-yellow-500'
                          }`}>
                            {isBroadcast ? <Send className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="font-bold text-gray-700 text-sm">NOT-{codeNumber}</div>
                            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                              {isBroadcast ? 'BROADCAST' : 'INFO'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 max-w-md">
                        <div className="font-bold text-gray-800 text-[15px]">{item.title}</div>
                        <div className="text-xs text-gray-500 mt-1.5 truncate">{item.message}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
                          {getTargetIcon(item.targetType)}
                          {getTargetLabel(item.targetType)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {item.isActive ? (
                          <div className="w-40">
                            <div className="flex justify-between text-xs mb-1.5 font-bold">
                              <span className="text-gray-500">Read Rate</span>
                              <span className="text-gray-700">85%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[13px] text-gray-400 font-semibold">N/A (รอส่ง)</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            item.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                          }`}>
                            {item.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {item.isActive ? 'ส่งแล้ว' : 'ตั้งเวลาส่ง'}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-2 font-medium">
                            {item.createDate ? format(new Date(item.createDate), configs?.dateTimeFormat || 'yyyy-MM-dd HH:mm:ss') : '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={lang === 'th' ? 'แก้ไข' : 'Edit'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={lang === 'th' ? 'ลบ' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" />
                {editingId 
                  ? (lang === 'th' ? 'แก้ไขประกาศ' : 'Edit Announcement')
                  : (lang === 'th' ? 'สร้างประกาศใหม่' : 'Create New Announcement')}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'th' ? 'หัวข้อประกาศ *' : 'Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder={lang === 'th' ? 'ระบุหัวข้อประกาศ...' : 'Enter announcement title...'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'th' ? 'รายละเอียดประกาศ *' : 'Message *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    placeholder={lang === 'th' ? 'ระบุรายละเอียด...' : 'Enter message content...'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'th' ? 'กลุ่มเป้าหมาย' : 'Target Audience'}
                  </label>
                  <select
                    value={formData.targetType}
                    onChange={(e) => setFormData({ ...formData, targetType: e.target.value, targetIds: [] })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="ALL">{lang === 'th' ? 'ทุกคนในระบบ (All)' : 'All Users'}</option>
                    <option value="DEPARTMENT">{lang === 'th' ? 'เฉพาะแผนก (Department)' : 'Specific Department'}</option>
                    <option value="ROLE">{lang === 'th' ? 'เฉพาะบทบาท (Role)' : 'Specific Role'}</option>
                    <option value="USER">{lang === 'th' ? 'เฉพาะผู้ใช้งาน (Users)' : 'Specific Users'}</option>
                  </select>
                </div>

                {formData.targetType !== 'ALL' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {lang === 'th' ? 'ระบุ ID (คั่นด้วยลูกน้ำ)' : 'Target IDs (comma separated)'}
                    </label>
                    <input
                      type="text"
                      value={Array.isArray(formData.targetIds) ? formData.targetIds.join(', ') : formData.targetIds}
                      onChange={(e) => setFormData({ ...formData, targetIds: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder={lang === 'th' ? 'เช่น: id1, id2, id3...' : 'e.g: id1, id2, id3...'}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {lang === 'th' ? '* ระบุ ID ของกลุ่มเป้าหมายที่ต้องการให้เห็นประกาศ' : '* Specify the IDs of the targets'}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                    {lang === 'th' ? 'เปิดใช้งานประกาศนี้ทันที' : 'Set Active Status'}
                  </label>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {lang === 'th' ? 'บันทึกข้อมูล' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
