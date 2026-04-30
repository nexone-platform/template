import fs from 'fs';
let p = 'c:/Task/Nex Solution/nex-speed/frontend/src/components/Topbar.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/const \[showUserMenu, setShowUserMenu\] = useState\(false\);\r?\n\s*const userMenuRef = useRef<HTMLDivElement>\(null\);/, `    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pwdOld, setPwdOld] = useState('');
    const [pwdNew, setPwdNew] = useState('');
    const [pwdConfirm, setPwdConfirm] = useState('');
    const [showPwdOld, setShowPwdOld] = useState(false);
    const [showPwdNew, setShowPwdNew] = useState(false);
    const [showPwdConfirm, setShowPwdConfirm] = useState(false);`);

fs.writeFileSync(p, c);
console.log('Fixed state manually');
