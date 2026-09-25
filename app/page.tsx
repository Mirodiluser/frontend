'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  RefreshCw, 
  Sparkles, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  Feather, 
  Coins, 
  ShieldCheck, 
  BookOpen, 
  Copy, 
  Check, 
  Loader2, 
  ArrowLeftRight, 
  FileType, 
  X, 
  Trash2, 
  Zap, 
  Flame, 
  Crown, 
  User, 
  LogOut, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  LogIn, 
  AlertTriangle, 
  ClipboardPaste, 
  Info,
  Clock,
  ExternalLink,
  PartyPopper,
  QrCode
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// SIZNING KARTA RAQAMINGIZ VA TO'LOV SILKALARI
const CARD_NUMBER = "5614688705522596";
const CLICK_P2P_URL = "https://my.click.uz/clickp2p/AD55BA719ACF0C31B5F5452F1E1BA7E74AF221A3E8877AB23189C4C8743368B6";
const PAYME_P2P_URL = "https://payme.uz/fallback/pay?card=" + CARD_NUMBER;

interface UserData {
  id: number;
  identifier: string;
  name: string;
  coins: number;
}

interface CoinPackage {
  id: string;
  amount: number;
  bonus?: number;
  priceUzs: string;
  priceUsd: string;
  numericPrice: number;
  popular?: boolean;
  bestValue?: boolean;
  badge?: string;
  iconType: 'basic' | 'popular' | 'vip';
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'translit' | 'corrector' | 'converter'>('translit');
  const [isDragging, setIsDragging] = useState(false);
  const [isConverterDragging, setIsConverterDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const [user, setUser] = useState<UserData | null>(null);
  const [userCoins, setUserCoins] = useState(0);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authIdentifier, setAuthIdentifier] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [showShop, setShowShop] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [walletStats, setWalletStats] = useState({
    coins: 0,
    totalSpent: 0,
    totalPurchased: 0,
    totalTransactions: 0,
    transactions: []
  });

  // To'lov jarayoni holatlari
  const [activeOrder, setActiveOrder] = useState<{
    orderId: string;
    pkg: CoinPackage;
    exactAmount: number;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [cardCopied, setCardCopied] = useState(false);
  const [amountCopied, setAmountCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successCoins, setSuccessCoins] = useState(0);

  const coinPackages: CoinPackage[] = [
    { id: 'pkg_15', amount: 15, priceUzs: '7 990 soʻm', priceUsd: '$0.69', numericPrice: 7990, badge: 'Boshlangʻich', iconType: 'basic' },
    { id: 'pkg_50', amount: 50, bonus: 5, priceUzs: '22 990 soʻm', priceUsd: '$1.95', numericPrice: 22990, badge: 'Tejamkor (-5%)', iconType: 'basic' },
    { id: 'pkg_100', amount: 100, bonus: 15, priceUzs: '42 990 soʻm', priceUsd: '$3.65', numericPrice: 42990, popular: true, badge: '🔥 Eng ommabop (-10%)', iconType: 'popular' },
    { id: 'pkg_250', amount: 250, bonus: 40, priceUzs: '99 990 soʻm', priceUsd: '$8.45', numericPrice: 99990, bestValue: true, badge: '⚡ Super Tejamkor (-15%)', iconType: 'popular' },
    { id: 'pkg_500', amount: 500, bonus: 80, priceUzs: '169 990 soʻm', priceUsd: '$14.40', numericPrice: 169990, badge: '🎓 OAK / Katta Tejamkor (-20%)', iconType: 'vip' },
    { id: 'pkg_1200', amount: 1000, bonus: 150, priceUzs: '309 990 soʻm', priceUsd: '$26.25', numericPrice: 309990, badge: '👑 VIP Cheksiz (-25%)', iconType: 'vip' },
  ];

  const [pageInfo, setPageInfo] = useState<{ pages: number; requiredCoins: number } | null>(null);
  const [isCountingPages, setIsCountingPages] = useState(false);

  const [converterFile, setConverterFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('pdf');
  const [isConverting, setIsConverting] = useState(false);

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isTransliterating, setIsTransliterating] = useState(false);
  const [direction, setDirection] = useState<'cyr2lat' | 'lat2cyr'>('cyr2lat');
  const translitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [grammarInput, setGrammarInput] = useState('');
  const [grammarData, setGrammarData] = useState<{
    hasErrors: boolean;
    highlightedText?: string;
    cleanText?: string;
    message?: string;
  } | null>(null);
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [grammarCopied, setGrammarCopied] = useState(false);

  const [isProcessingDoc, setIsProcessingDoc] = useState(false);

  const loadUserWallet = useCallback(async (uid: number) => {
    setIsLoadingWallet(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/${uid}`);
      if (res.ok) {
        const data = await res.json();
        setWalletStats(data);
        setUserCoins(data.coins);
      }
    } catch {
      console.error('Hamyonni yuklashda xatolik yuz berdi');
    } finally {
      setIsLoadingWallet(false);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('tahrir_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        loadUserWallet(parsed.id);
      } catch {
        localStorage.removeItem('tahrir_user');
      }
    }
  }, [loadUserWallet]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAuthModal(false);
        setShowShop(false);
        setSelectedPackage(null);
        if (!paymentSuccess) setActiveOrder(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paymentSuccess]);

  // Taymer va to'lovni avtomatik tekshirish
  useEffect(() => {
    if (!activeOrder || paymentSuccess) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setActiveOrder(null);
          addToast('warning', 'Vaqt tugadi', "To'lov sessiyasi muddati tugadi. Iltimos qaytadan urinib ko'ring.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const polling = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/payment/check-status/${activeOrder.orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'PAID') {
            clearInterval(timer);
            clearInterval(polling);
            const totalGained = activeOrder.pkg.amount + (activeOrder.pkg.bonus || 0);
            setSuccessCoins(totalGained);
            setPaymentSuccess(true);
            setActiveOrder(null);
            if (user) await loadUserWallet(user.id);
          }
        }
      } catch {
        // Tarmoq xatolarini sokin o'tkazib yuboramiz
      }
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(polling);
    };
  }, [activeOrder, paymentSuccess, user, loadUserWallet, addToast]);

  const handleStartPayment = async (pkg: CoinPackage) => {
    if (!user) {
      setShowShop(false);
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    const exactAmount = pkg.numericPrice;
    const clientOrderId = `ord_${Date.now()}_${user.id}`;

    try {
      await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: clientOrderId,
          userId: user.id,
          packageId: pkg.id,
          amount: exactAmount,
          coins: pkg.amount + (pkg.bonus || 0)
        })
      });
    } catch {
      // Server javob bermasa ham to'lov oynasi ochiladi
    }

    setActiveOrder({
      orderId: clientOrderId,
      pkg,
      exactAmount: exactAmount
    });
    setTimeLeft(600);
    setShowShop(false);
    setSelectedPackage(null);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (authPassword.length < 6) {
      setAuthError('Parol kamida 6 ta belgidan iborat boʻlishi shart');
      return;
    }

    setIsAuthLoading(true);
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: authIdentifier,
          password: authPassword,
          name: authName
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setAuthError(data.error || 'Xatolik yuz berdi');
        setIsAuthLoading(false);
        return;
      }

      localStorage.setItem('tahrir_user', JSON.stringify(data.user));
      localStorage.setItem('tahrir_token', data.token);
      setUser(data.user);
      setUserCoins(data.user.coins);
      setShowAuthModal(false);
      setAuthIdentifier('');
      setAuthPassword('');
      setAuthName('');
      loadUserWallet(data.user.id);
      addToast('success', 'Muvaffaqiyatli!', authMode === 'login' ? 'Tizimga xush kelibsiz!' : 'Yangi hisob ochildi va +15 tanga berildi!');
    } catch {
      setAuthError('Serverga ulanishda xatolik yuz berdi');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tahrir_user');
    localStorage.removeItem('tahrir_token');
    setUser(null);
    setUserCoins(0);
    setWalletStats({ coins: 0, totalSpent: 0, totalPurchased: 0, totalTransactions: 0, transactions: [] });
    addToast('info', 'Chiqildi', 'Hisobdan chiqdingiz');
  };

  const requestTransliteration = async (text: string, currentDirection: 'cyr2lat' | 'lat2cyr') => {
    if (!text.trim()) {
      setOutputText('');
      setIsTransliterating(false);
      return;
    }

    setIsTransliterating(true);
    try {
      const res = await fetch(`${API_URL}/api/transliterate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, direction: currentDirection })
      });
      const data = await res.json();
      if (data.result) setOutputText(data.result);
    } catch {
      console.error('Transliteratsiya xatosi');
    } finally {
      setIsTransliterating(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);

    if (translitTimeoutRef.current) clearTimeout(translitTimeoutRef.current);
    translitTimeoutRef.current = setTimeout(() => {
      requestTransliteration(text, direction);
    }, 280);
  };

  const handlePasteToTranslit = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        requestTransliteration(text, direction);
        addToast('info', 'Qoʻyildi', 'Matn buferdan joylandi');
      }
    } catch {
      addToast('error', 'Ruxsat yoʻq', 'Buferdan oʻqish taqiqlandi');
    }
  };

  const toggleDirection = () => {
    if (translitTimeoutRef.current) clearTimeout(translitTimeoutRef.current);
    const newDirection = direction === 'cyr2lat' ? 'lat2cyr' : 'cyr2lat';
    setDirection(newDirection);
    const newIn = outputText;
    setInputText(newIn);
    setOutputText('');
    if (newIn.trim()) requestTransliteration(newIn, newDirection);
  };

  const handleCheckGrammar = async () => {
    if (!grammarInput.trim()) return;
    
    setIsCheckingGrammar(true);
    setGrammarData(null);
    
    try {
      const res = await fetch(`${API_URL}/api/check-grammar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: grammarInput })
      });
      const data = await res.json();
      
      if (data.result) {
        try {
          const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
          setGrammarData(parsed);
        } catch {
          setGrammarData({ hasErrors: false, message: data.result, cleanText: grammarInput });
        }
      }
    } catch {
      addToast('error', 'Xatolik', 'Serverga ulanib boʻlmadi');
    } finally {
      setIsCheckingGrammar(false);
    }
  };

  const copyGrammarResult = () => {
    const textToCopy = grammarData?.cleanText || grammarInput;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setGrammarCopied(true);
    addToast('success', 'Nusxalandi', 'Tuzatilgan matn nusxalandi');
    setTimeout(() => setGrammarCopied(false), 2000);
  };

  const processSelectedFile = async (selectedFile: File) => {
    const validExtensions = ['.docx', '.doc', '.txt', '.pdf'];
    const fileNameLower = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileNameLower.endsWith(ext));

    if (!isValid) {
      addToast('warning', 'Notoʻgʻri format!', 'Faqat .docx, .doc, .txt yoki .pdf formatidagi fayllar qabul qilinadi.');
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      addToast('error', 'Hajm katta', 'Fayl hajmi 25 MB dan oshmasligi kerak.');
      return;
    }

    setFile(selectedFile);
    setIsCountingPages(true);

    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      const res = await fetch(`${API_URL}/api/count-pages`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.pages) {
        setPageInfo({ pages: data.pages, requiredCoins: data.requiredCoins });
      } else {
        setPageInfo({ pages: 1, requiredCoins: 1 });
      }
    } catch {
      setPageInfo({ pages: 1, requiredCoins: 1 });
    } finally {
      setIsCountingPages(false);
    }
  };

  const handleProcessDocx = async () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    if (!file || !pageInfo) return;

    if (userCoins < pageInfo.requiredCoins) {
      addToast('error', 'Yetarli tanga yoʻq!', `Kerak: ${pageInfo.requiredCoins} tanga, sizda: ${userCoins} tanga.`);
      setTimeout(() => setShowShop(true), 900);
      return;
    }

    setIsProcessingDoc(true);
    
    const formData = new FormData();
    formData.append('document', file);
    formData.append('userId', String(user.id));

    try {
      const res = await fetch(`${API_URL}/api/check-file`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tahrirlangan_${file.name}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);

        addToast('success', 'Tayyor!', `Hujjat muvaffaqiyatli tahrirlandi (-{pageInfo.requiredCoins} tanga).`);
        await loadUserWallet(user.id);
      } else {
        const errorData = await res.json().catch(() => ({}));
        addToast('error', 'Xatolik', errorData.error || 'Hujjatni qayta ishlashda xatolik yuz berdi.');
      }
    } catch {
      addToast('error', 'Xatolik', 'Serverga ulanib boʻlmadi.');
    } finally {
      setIsProcessingDoc(false);
    }
  };

  const handleSelectConverterFile = (selectedFile: File) => {
    const validExts = ['.docx', '.doc', '.txt', '.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    const lower = selectedFile.name.toLowerCase();
    const isSupported = validExts.some((ext) => lower.endsWith(ext));

    if (!isSupported) {
      addToast('warning', 'Qoʻllab-quvvatlanmaydi!', 'Faqat DOCX, PDF, TXT yoki rasmlar (JPG, PNG, WebP) qabul qilinadi.');
      return;
    }

    setConverterFile(selectedFile);
  };

  const handleConvertFile = async () => {
    if (!converterFile) return;

    setIsConverting(true);

    const formData = new FormData();
    formData.append('files', converterFile);
    formData.append('targetFormat', targetFormat);

    try {
      const res = await fetch(`${API_URL}/api/convert-file`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const nameWithoutExt = converterFile.name.substring(0, converterFile.name.lastIndexOf('.')) || converterFile.name;
        a.download = `${nameWithoutExt}.${targetFormat}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);

        addToast('success', 'Oʻgirildi!', 'Fayl muvaffaqiyatli konvertatsiya qilindi!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        addToast('error', 'Xatolik', errorData.error || 'Faylni oʻgirishda xatolik yuz berdi.');
      }
    } catch {
      addToast('error', 'Xatolik', 'Serverga ulanib boʻlmadi.');
    } finally {
      setIsConverting(false);
    }
  };

  const copyToClipboard = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    addToast('success', 'Nusxalandi', 'Lotin alifbosidagi matn nusxalandi');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val);
  };

  const copyCard = () => {
    navigator.clipboard.writeText(CARD_NUMBER);
    setCardCopied(true);
    addToast('success', 'Nusxalandi', 'Karta raqami buferga nusxalandi');
    setTimeout(() => setCardCopied(false), 2000);
  };

  const copyAmount = () => {
    if (!activeOrder) return;
    navigator.clipboard.writeText(String(activeOrder.exactAmount));
    setAmountCopied(true);
    addToast('success', 'Nusxalandi', 'Aniq summa nusxalandi');
    setTimeout(() => setAmountCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#070504] text-[#F3ECE6] selection:bg-[#D4A373]/35 selection:text-[#FFF] font-sans relative overflow-x-hidden">
      
      {/* 1. JONLI KUTUBXONA FON TUZILMASI */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 50% 28%, rgba(10, 7, 5, 0.65) 0%, rgba(10, 7, 5, 0.25) 50%, transparent 75%),
            linear-gradient(180deg, rgba(7, 5, 4, 0.15) 0%, rgba(7, 5, 4, 0.4) 50%, rgba(7, 5, 4, 0.75) 100%),
            url('/dark-library.jpg')
          `,
          filter: 'contrast(108%) brightness(1.05) saturate(115%)'
        }}
      >
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-[#D4A373]/12 blur-[150px] rounded-full" />
      </div>

      {/* TOAST BILDIRISHNOMALARI (Z-INDEX 9999 BILAN OYNA USTIDA TURADI) */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ duration: 0.22 }}
              className={`p-4 rounded-2xl border shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl pointer-events-auto flex items-start gap-3 ${
                toast.type === 'success' 
                  ? 'bg-[#0E1610]/95 border-emerald-500/40 text-[#E3F2E7]' 
                  : toast.type === 'error' 
                  ? 'bg-[#180A0A]/95 border-rose-500/40 text-[#FCEBEB]' 
                  : toast.type === 'warning'
                  ? 'bg-[#1A1208]/95 border-amber-500/60 text-[#FFF5E6] ring-1 ring-amber-500/30'
                  : 'bg-[#120D0A]/95 border-[#D4A373]/35 text-[#F3ECE6]'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
                {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-[#D4A373]" />}
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-bold leading-tight">{toast.title}</p>
                <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} 
                className="opacity-60 hover:opacity-100 p-0.5 text-xs transition-opacity cursor-pointer pointer-events-auto"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* SHAPKA / NAV QISMI */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-black/35 border-b border-[#D4A373]/15 transition-all">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E2B180] to-[#8C6239] p-[1px] shadow-lg shadow-[#D4A373]/20 transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-[#120D0B] rounded-2xl flex items-center justify-center">
                <Feather className="w-5 h-5 text-[#E0A96D] transition-transform duration-300 group-hover:rotate-12" />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-serif font-bold tracking-wider text-[#FBF5F0] drop-shadow-sm">
              TAHRIR<span className="text-[#D4A373] drop-shadow-[0_0_15px_rgba(212,163,115,0.4)]">.AI</span>
            </span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5 sm:gap-3.5"
          >
            {user ? (
              <>
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowShop(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#140E0B]/80 border border-[#D4A373]/30 shadow-inner hover:border-[#D4A373]/60 transition-all cursor-pointer backdrop-blur-md"
                >
                  <Coins className="w-4 h-4 text-[#D4A373] animate-pulse" />
                  <span className="text-xs sm:text-sm font-semibold text-[#E0A96D]">{userCoins} tanga</span>
                </motion.button>

                <div className="flex items-center gap-2 bg-[#140E0B]/80 border border-[#2A1F1A] py-1.5 px-3 rounded-xl backdrop-blur-md">
                  <div className="w-6 h-6 rounded-lg bg-[#271B16] flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-[#D4A373]" />
                  </div>
                  <span className="text-xs font-semibold text-[#EDE1D6] max-w-[100px] sm:max-w-[130px] truncate">{user.name}</span>
                  <button 
                    onClick={handleLogout} 
                    title="Chiqish"
                    className="text-[#8C7A6B] hover:text-rose-400 p-1 transition-colors rounded-md hover:bg-rose-500/10 ml-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                className="px-4 py-2 rounded-xl bg-[#140E0B]/80 border border-[#3A2B23] text-xs font-bold text-[#EFE5DC] hover:border-[#D4A373]/50 hover:bg-[#1E1511] transition-all flex items-center gap-1.5 shadow-md backdrop-blur-md cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Kirish</span>
              </motion.button>
            )}

            <motion.button 
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => user ? setShowShop(true) : setShowAuthModal(true)}
              className="px-4 sm:px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#D4A373] via-[#BA8A59] to-[#8C6239] text-[#0A0706] shadow-md shadow-[#D4A373]/20 hover:shadow-[#D4A373]/35 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Doʻkon</span>
            </motion.button>
          </motion.div>
        </div>
      </header>

      {/* ASOSIY QISM */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-24 text-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#120D0A]/85 border border-[#D4A373]/35 text-xs font-medium text-[#E0A96D] mb-6 backdrop-blur-xl shadow-lg shadow-black/40">
            <BookOpen className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>O&lsquo;zbek filologiyasining akademik standarti</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4A373] animate-ping" />
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-normal tracking-tight text-[#FAF6F0] max-w-3xl mx-auto leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
            Mukammal grammatika{' '}
            <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-[#F7D8B5] via-[#E2B180] to-[#B37E4C] drop-shadow-[0_0_30px_rgba(212,163,115,0.35)]">
              va matn sofligi
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#D4C4B5] max-w-xl mx-auto font-light leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
            Katta hajmdagi ilmiy dissertatsiya va maqolalarni bir zumda Kirilldan Lotinga oʻgirish, imlo xatolarini sunʼiy intellekt orqali tahrirlash hamda fayllarni erkin konvertatsiya qilish.
          </p>
        </motion.div>

        {/* TABLAR */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-10 flex justify-center"
        >
          <div className="p-1.5 rounded-2xl bg-[#120D0A]/85 border border-[#D4A373]/20 backdrop-blur-2xl flex flex-wrap gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
            {[
              { id: 'translit', label: 'Kirill ↔ Latin', icon: RefreshCw, badge: 'Cheksiz' },
              { id: 'corrector', label: 'Imlo Tahrirchi', icon: Sparkles, badge: 'AI Pro' },
              { id: 'converter', label: 'Fayl Konverter', icon: FileType, badge: 'Bepul' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-5 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    isActive ? 'text-[#FFF]' : 'text-[#A89485] hover:text-[#E0A96D]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-gradient-to-r from-[#D4A373]/25 via-[#D4A373]/15 to-[#8C6239]/25 rounded-xl border border-[#D4A373]/50 shadow-[0_0_25px_rgba(212,163,115,0.2)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 relative z-10 transition-colors ${isActive ? 'text-[#E0A96D]' : ''}`} />
                  <span className="relative z-10">{tab.label}</span>
                  {tab.badge && (
                    <span className={`relative z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                      tab.badge === 'Bepul' || tab.badge === 'Cheksiz' 
                        ? 'bg-[#D4A373]/20 text-[#E0A96D] border border-[#D4A373]/35' 
                        : 'bg-gradient-to-r from-[#D4A373] to-[#8C6239] text-[#0A0706] font-extrabold'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* TABLAR ICHIDAGI MAYDON */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            
            {activeTab === 'translit' && (
              <motion.div 
                key="tab-translit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="text-left"
              >
                <div className="flex items-center justify-center gap-3 mb-5">
                  <span className={`text-xs font-bold tracking-wider uppercase transition-all drop-shadow-sm ${direction === 'cyr2lat' ? 'text-[#E0A96D]' : 'text-[#8C7A6B]'}`}>
                    KIRILL
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleDirection}
                    title="Almashtirish"
                    className="w-9 h-9 rounded-xl bg-[#140E0B]/90 border border-[#3A2B23] flex items-center justify-center text-[#A89485] hover:text-[#E0A96D] hover:border-[#D4A373]/60 transition-all shadow-md backdrop-blur-md cursor-pointer"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </motion.button>
                  <span className={`text-xs font-bold tracking-wider uppercase transition-all drop-shadow-sm ${direction === 'lat2cyr' ? 'text-[#E0A96D]' : 'text-[#8C7A6B]'}`}>
                    LOTIN
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-[#120D0A]/85 border border-[#D4A373]/20 rounded-3xl p-5 flex flex-col h-[360px] shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl focus-within:border-[#D4A373]/60 transition-all">
                    <div className="flex justify-between items-center pb-3 border-b border-[#231914] text-xs font-bold text-[#E0A96D]">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#D4A373] shadow-[0_0_8px_#D4A373]" />
                        {direction === 'cyr2lat' ? 'KIRILL MATNI' : 'LOTIN MATNI'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePasteToTranslit}
                          className="text-[#A89485] hover:text-[#E0A96D] text-xs transition-colors flex items-center gap-1 bg-[#1E1511] px-2 py-0.5 rounded-md border border-[#2A1F1A] cursor-pointer"
                          title="Buferdan qoʻyish"
                        >
                          <ClipboardPaste className="w-3.5 h-3.5" /> Qoʻyish
                        </button>
                        {inputText && (
                          <button 
                            onClick={() => { setInputText(''); setOutputText(''); }} 
                            className="text-[#A89485] hover:text-rose-400 text-xs transition-colors flex items-center gap-1 bg-[#1E1511] px-2 py-0.5 rounded-md border border-[#2A1F1A] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="text-[#A89485] bg-[#1E1511] px-2 py-0.5 rounded-md border border-[#2A1F1A] text-[11px]">
                          {inputText.length} belgi ({inputText.trim() ? inputText.trim().split(/\s+/).length : 0} soʻz)
                        </span>
                      </div>
                    </div>
                    <textarea
                      value={inputText}
                      onChange={handleTextChange}
                      placeholder={direction === 'cyr2lat' ? 'Kirill alifbosidagi matnni bu yerga kiriting...' : 'Lotin alifbosidagi matnni bu yerga kiriting...'}
                      className="w-full h-full bg-transparent resize-none outline-none mt-3 text-xs sm:text-sm text-[#FBF5F0] placeholder-[#7A6A5E] leading-relaxed font-normal"
                    />
                  </div>

                  <div className="bg-[#120D0A]/85 border border-[#D4A373]/20 rounded-3xl p-5 flex flex-col h-[360px] shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl relative">
                    <div className="flex justify-between items-center pb-3 border-b border-[#231914] text-xs font-bold text-[#E0A96D]">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#8C6239]" />
                        {direction === 'cyr2lat' ? 'LOTIN NATIJASI' : 'KIRILL NATIJASI'}
                      </span>
                      {outputText && (
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={copyToClipboard}
                          className="flex items-center gap-1.5 text-xs text-[#E0A96D] hover:text-[#FFF] bg-[#1E1511] px-2.5 py-1 rounded-lg border border-[#3A2B23] transition-all shadow-sm cursor-pointer"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Nusxalandi!' : 'Nusxa olish'}</span>
                        </motion.button>
                      )}
                    </div>
                    <div className="w-full h-full overflow-y-auto mt-3 text-xs sm:text-sm text-[#EAE0D5] leading-relaxed whitespace-pre-wrap">
                      {isTransliterating ? (
                        <div className="flex items-center gap-2.5 text-[#A89485] h-full justify-center text-xs">
                          <Loader2 className="w-4 h-4 animate-spin text-[#D4A373]" />
                          <span>Oʻgirilmoqda...</span>
                        </div>
                      ) : (
                        outputText || <span className="text-[#7A6A5E] italic">Natija bu yerda aks etadi...</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'corrector' && (
              <motion.div 
                key="tab-corrector"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="max-w-4xl mx-auto space-y-6 text-left"
              >
                <div className="bg-[#120D0A]/85 border border-[#D4A373]/20 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl focus-within:border-[#D4A373]/60 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-medium text-[#FBF5F0] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D4A373]" />
                      Matn imlosini tekshirish
                    </h3>
                    <span className="text-xs text-[#A89485] bg-[#1E1511] px-2 py-0.5 rounded-md border border-[#2A1F1A]">Gemini AI</span>
                  </div>
                  
                  <textarea
                    value={grammarInput}
                    onChange={(e) => setGrammarInput(e.target.value)}
                    placeholder="Tekshiriladigan qisqa matn, reja yoki tezisni kiriting..."
                    className="w-full h-32 bg-[#0C0806]/90 border border-[#241A15] rounded-2xl p-3.5 text-xs sm:text-sm text-[#FBF5F0] placeholder-[#7A6A5E] outline-none focus:border-[#D4A373]/50 transition-all resize-none leading-relaxed"
                  />

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-[#A89485]">{grammarInput.length} belgi</span>
                    <motion.button
                      onClick={handleCheckGrammar}
                      disabled={!grammarInput.trim() || isCheckingGrammar}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A373] to-[#8C6239] text-[#0A0706] font-bold text-xs shadow-lg shadow-[#D4A373]/15 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isCheckingGrammar ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>AI tekshirmoqda...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Imloni tuzatish</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {grammarData && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 bg-[#0C0806]/90 border border-[#241A15] rounded-2xl p-4 relative overflow-hidden"
                      >
                        <div className="flex justify-between items-center pb-2 mb-3 border-b border-[#231914]">
                          <span className="text-xs font-bold tracking-wider text-[#E0A96D]">
                            {grammarData.hasErrors ? '✨ TUZATILGAN MATN' : '✅ NATIJA'}
                          </span>
                          {(grammarData.cleanText || grammarData.highlightedText) && (
                            <button 
                              onClick={copyGrammarResult}
                              className="flex items-center gap-1.5 text-xs text-[#E0A96D] hover:text-[#FFF] bg-[#1E1511] px-2.5 py-1 rounded-lg border border-[#3A2B23] cursor-pointer"
                            >
                              {grammarCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{grammarCopied ? 'Nusxalandi!' : 'Nusxa'}</span>
                            </button>
                          )}
                        </div>
                        {grammarData.hasErrors && grammarData.highlightedText ? (
                          <div 
                            className="text-xs sm:text-sm text-[#EFE5DC] leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: grammarData.highlightedText }}
                          />
                        ) : (
                          <p className="text-xs sm:text-sm text-[#EFE5DC] leading-relaxed">{grammarData.message || grammarData.cleanText}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="bg-[#120D0A]/85 border border-[#D4A373]/20 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-medium text-[#FBF5F0] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#D4A373]" />
                      Hujjatni tahrir qilish (Dissertatsiya, Maqola, Referat)
                    </h3>
                    <span className="text-xs text-[#A89485]">1 sahifa = 1 tanga</span>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files?.[0]) processSelectedFile(e.dataTransfer.files[0]);
                    }}
                    onClick={() => document.getElementById('fileInput')?.click()}
                    className={`relative rounded-2xl p-8 border-2 border-dashed transition-all duration-200 bg-[#0C0806]/85 cursor-pointer flex flex-col items-center text-center ${
                      isDragging 
                        ? 'border-[#D4A373] bg-[#D4A373]/10 scale-[1.01]' 
                        : 'border-[#2D211A] hover:border-[#D4A373]/50'
                    }`}
                  >
                    <input
                      id="fileInput"
                      type="file"
                      accept=".docx,.doc,.txt,.pdf"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && processSelectedFile(e.target.files[0])}
                    />

                    <div className="w-12 h-12 rounded-2xl bg-[#1E1511] border border-[#3A2B23] flex items-center justify-center text-[#D4A373] mb-3 shadow-md">
                      <UploadCloud className="w-6 h-6" />
                    </div>

                    {file ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-3 bg-[#1E1511] border border-[#D4A373]/40 px-4 py-2.5 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-[#D4A373]" />
                          <div className="text-left">
                            <p className="text-xs sm:text-sm font-semibold text-[#FBF5F0]">{file.name}</p>
                            <p className="text-[10px] text-[#A89485]">{formatFileSize(file.size)}</p>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setFile(null); setPageInfo(null); }}
                            className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 ml-2 cursor-pointer"
                            title="Oʻchirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {isCountingPages ? (
                          <div className="flex items-center gap-2 text-xs text-[#A89485]">
                            <Loader2 className="w-3 h-3 animate-spin text-[#D4A373]" />
                            <span>Sahifalar soni hisoblanmoqda...</span>
                          </div>
                        ) : pageInfo && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#D4A373]/10 border border-[#D4A373]/30 text-xs text-[#E0A96D] font-medium">
                            <span>📄 Hajmi: <b>{pageInfo.pages} sahifa</b></span>
                            <span>•</span>
                            <span>💰 Narxi: <b>{pageInfo.requiredCoins} tanga</b></span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <h4 className="text-sm sm:text-base font-medium text-[#FBF5F0]">
                          Hujjatni bu yerga tashlang yoki <span className="text-[#D4A373] underline decoration-[#D4A373]/40 underline-offset-4">faylni tanlang</span>
                        </h4>
                        <p className="mt-1 text-xs text-[#A89485]">Faqat .DOCX, .DOC, .TXT, .PDF formatlari qabul qilinadi.</p>
                      </>
                    )}

                    <motion.button
                      onClick={(e) => { e.stopPropagation(); handleProcessDocx(); }}
                      disabled={!file || isProcessingDoc || isCountingPages}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-6 px-7 py-3 rounded-xl bg-gradient-to-r from-[#D4A373] to-[#8C6239] text-[#0A0706] font-bold text-xs sm:text-sm shadow-lg shadow-[#D4A373]/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isProcessingDoc ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Gemini AI tahlil qilmoqda...</span>
                        </>
                      ) : (
                        <>
                          <span>Tekshirishni boshlash {pageInfo ? `(-{pageInfo.requiredCoins} tanga)` : ''}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'converter' && (
              <motion.div 
                key="tab-converter"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="max-w-4xl mx-auto text-left"
              >
                <div className="bg-[#120D0A]/85 border border-[#D4A373]/20 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium text-[#FBF5F0] flex items-center gap-2">
                      <FileType className="w-4 h-4 text-[#D4A373]" />
                      Universal Fayl Konverter
                    </h3>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                      Cheksiz Bepul
                    </span>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsConverterDragging(true); }}
                    onDragLeave={() => setIsConverterDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsConverterDragging(false);
                      if (e.dataTransfer.files?.[0]) handleSelectConverterFile(e.dataTransfer.files[0]);
                    }}
                    onClick={() => document.getElementById('converterFileInput')?.click()}
                    className={`relative rounded-2xl p-8 border-2 border-dashed transition-all duration-200 bg-[#0C0806]/85 cursor-pointer flex flex-col items-center text-center ${
                      isConverterDragging 
                        ? 'border-[#D4A373] bg-[#D4A373]/10 scale-[1.01]' 
                        : 'border-[#2D211A] hover:border-[#D4A373]/50'
                    }`}
                  >
                    <input
                      id="converterFileInput"
                      type="file"
                      accept=".docx,.doc,.txt,.pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleSelectConverterFile(e.target.files[0])}
                    />
                    
                    <div className="w-12 h-12 rounded-2xl bg-[#1E1511] border border-[#3A2B23] flex items-center justify-center text-[#D4A373] mb-3 shadow-md">
                      <UploadCloud className="w-6 h-6" />
                    </div>

                    {converterFile ? (
                      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                        <div className="flex items-center justify-between w-full bg-[#1E1511] border border-[#D4A373]/40 px-4 py-2.5 rounded-xl">
                          <div className="flex items-center gap-2.5 text-left">
                            <CheckCircle2 className="w-4 h-4 text-[#D4A373]" />
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-[#FBF5F0] truncate max-w-[200px]">{converterFile.name}</p>
                              <p className="text-[10px] text-[#A89485]">{formatFileSize(converterFile.size)}</p>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setConverterFile(null); }}
                            className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                            title="Oʻchirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="w-full bg-[#140E0B] border border-[#291E18] p-3 rounded-xl" onClick={(e) => e.stopPropagation()}>
                          <p className="text-[11px] text-[#A89485] mb-2 text-center font-medium">Qaysi formatga oʻgirish kerak?</p>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'pdf', label: 'PDF (.pdf)' },
                              { id: 'docx', label: 'Word (.docx)' },
                              { id: 'txt', label: 'Matn (.txt)' }
                            ].map((fmt) => (
                              <button
                                key={fmt.id}
                                onClick={() => setTargetFormat(fmt.id)}
                                className={`py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                                  targetFormat === fmt.id
                                    ? 'bg-[#D4A373] text-[#0A0706] border-[#D4A373] font-bold'
                                    : 'bg-[#1E1511] text-[#A89485] border-[#2A1F1A] hover:text-[#E0A96D]'
                                }`}
                              >
                                {fmt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-sm sm:text-base font-medium text-[#FBF5F0]">
                          Hujjat yoki rasmni bu yerga tashlang yoki <span className="text-[#D4A373] underline decoration-[#D4A373]/40 underline-offset-4">faylni tanlang</span>
                        </h4>
                        <p className="mt-1 text-xs text-[#A89485]">DOCX, PDF, TXT, JPG, PNG, WebP qabul qilinadi.</p>
                      </>
                    )}

                    <motion.button
                      onClick={(e) => { e.stopPropagation(); handleConvertFile(); }}
                      disabled={!converterFile || isConverting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-[#D4A373] to-[#8C6239] text-[#0A0706] font-bold text-xs sm:text-sm shadow-lg shadow-[#D4A373]/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isConverting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Oʻgirilmoqda...</span>
                        </>
                      ) : (
                        <>
                          <span>Oʻgirish va Yuklab olish</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* KAFOLATLAR */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-[#A89485]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#D4A373]" />
            <span>Asl format va uslub toʻliq saqlanadi</span>
          </div>
          <div>•</div>
          <div>Akademik standartlar boʻyicha tahrir</div>
          <div>•</div>
          <div>100% Maxfiy va Xavfsiz</div>
        </div>

      </div>

      {/* DO'KON MODAL OYNASI */}
      <AnimatePresence>
        {showShop && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl p-4"
            onClick={() => setShowShop(false)}
          >
            <motion.div 
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
              className="bg-[#120D0A]/95 border border-[#D4A373]/40 rounded-3xl p-5 sm:p-7 w-full max-w-3xl shadow-[0_30px_90px_rgba(0,0,0,0.85)] backdrop-blur-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-[#291E18] shrink-0">
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-[#FBF5F0] flex items-center gap-2">
                    <Coins className="w-5 h-5 text-[#D4A373]" /> Tanga Doʻkoni
                  </h2>
                  <p className="text-[11px] text-[#A89485] mt-0.5">Kerakli sahifalar hajmiga mos eng qulay paketni tanlang</p>
                </div>
                <button 
                  onClick={() => setShowShop(false)} 
                  className="w-8 h-8 rounded-xl bg-[#1E1511] border border-[#2E211B] flex items-center justify-center text-[#A89485] hover:text-[#FFF] transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto pr-1 py-4 space-y-3.5 flex-1 text-left">
                
                <div className="bg-gradient-to-r from-[#1E1511] via-[#160F0C] to-[#1E1511] border border-[#D4A373]/30 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D4A373]/15 border border-[#D4A373]/30 flex items-center justify-center">
                      <Coins className="w-4 h-4 text-[#D4A373] animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#A89485]">Joriy balansingiz</p>
                      <p className="text-lg font-serif font-bold text-[#FBF5F0]">
                        {userCoins} <span className="text-xs font-sans font-normal text-[#E0A96D]">tanga</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    Faol hisob
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {coinPackages.map((pkg) => {
                    const totalCoins = pkg.amount + (pkg.bonus || 0);

                    return (
                      <motion.div
                        key={pkg.id}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`relative rounded-2xl p-4 border cursor-pointer transition-all flex flex-col justify-between group ${
                          pkg.popular
                            ? 'bg-gradient-to-b from-[#241712] to-[#140E0B] border-[#D4A373] shadow-[0_5px_20px_rgba(212,163,115,0.15)]'
                            : pkg.bestValue
                            ? 'bg-gradient-to-b from-[#20140E] to-[#140E0B] border-[#E0A96D]/80'
                            : 'bg-[#1A120E]/80 border-[#291E18] hover:border-[#D4A373]/50'
                        }`}
                      >
                        {pkg.badge && (
                          <div className="mb-2">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md inline-block ${
                              pkg.popular 
                                ? 'bg-[#D4A373] text-[#0A0706]' 
                                : pkg.bestValue
                                ? 'bg-gradient-to-r from-[#E0A96D] to-[#8C6239] text-[#0A0706]'
                                : 'bg-[#D4A373]/15 text-[#E0A96D] border border-[#D4A373]/30'
                            }`}>
                              {pkg.badge}
                            </span>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-1.5">
                            {pkg.iconType === 'vip' ? (
                              <Crown className="w-4 h-4 text-[#E0A96D]" />
                            ) : pkg.iconType === 'popular' ? (
                              <Flame className="w-4 h-4 text-[#D4A373]" />
                            ) : (
                              <Coins className="w-4 h-4 text-[#A89485]" />
                            )}
                            <span className="text-lg font-serif font-bold text-[#FBF5F0]">{pkg.amount}</span>
                            <span className="text-xs text-[#A89485]">tanga</span>
                          </div>

                          {pkg.bonus && (
                            <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                              +{pkg.bonus} bonus <span className="text-[#A89485]">({totalCoins} jami)</span>
                            </p>
                          )}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-[#241A15] flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#FBF5F0]">{pkg.priceUzs}</p>
                            <p className="text-[9px] text-[#A89485]">{pkg.priceUsd}</p>
                          </div>
                          <div className="w-6 h-6 rounded-lg bg-[#D4A373]/10 border border-[#D4A373]/30 flex items-center justify-center text-[#D4A373] group-hover:bg-[#D4A373] group-hover:text-[#0A0706] transition-all">
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

              </div>

              <div className="pt-2.5 border-t border-[#291E18] grid grid-cols-3 gap-2 text-center text-xs text-[#A89485] shrink-0">
                <div className="bg-[#1A120E] p-1.5 rounded-xl border border-[#291E18]">
                  <p className="text-[#E0A96D] font-bold text-xs">{walletStats.totalPurchased}</p>
                  <p className="text-[9px]">Sotib olingan</p>
                </div>
                <div className="bg-[#1A120E] p-1.5 rounded-xl border border-[#291E18]">
                  <p className="text-[#E0A96D] font-bold text-xs">{walletStats.totalSpent}</p>
                  <p className="text-[9px]">Sarflangan</p>
                </div>
                <div className="bg-[#1A120E] p-1.5 rounded-xl border border-[#291E18]">
                  <p className="text-[#E0A96D] font-bold text-xs">{walletStats.totalTransactions}</p>
                  <p className="text-[9px]">Amallar</p>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SOTIB OLISHNI TASDIQLASH (PAKET OYNASI) */}
      <AnimatePresence>
        {selectedPackage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl p-4"
            onClick={() => setSelectedPackage(null)}
          >
            <motion.div 
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-[#120D0A] border border-[#D4A373]/50 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A373]/20 to-[#8C6239]/10 border border-[#D4A373]/40 mx-auto flex items-center justify-center text-[#D4A373] mb-3 shadow-md">
                <Coins className="w-6 h-6 animate-bounce" />
              </div>

              <h3 className="text-base font-serif font-bold text-[#FBF5F0]">
                To‘lov usulini tanlaysizmi?
              </h3>
              
              <div className="mt-3.5 bg-[#1E1511] border border-[#291E18] rounded-xl p-3 text-left space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#A89485]">Paket:</span>
                  <span className="font-bold text-[#FBF5F0]">{selectedPackage.amount} tanga</span>
                </div>
                {selectedPackage.bonus && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#A89485]">Bonus:</span>
                    <span className="font-bold text-emerald-400">+{selectedPackage.bonus} tanga</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1.5 border-t border-[#291E18]">
                  <span className="text-[#A89485]">Jami tangalar:</span>
                  <span className="font-bold text-[#E0A96D]">
                    {selectedPackage.amount + (selectedPackage.bonus || 0)} tanga
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#A89485]">Toʻlov narxi:</span>
                  <span className="font-bold text-[#FBF5F0]">{selectedPackage.priceUzs}</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPackage(null)}
                  className="py-2.5 px-3 rounded-xl border border-[#291E18] bg-[#1E1511] text-xs font-semibold text-[#A89485] hover:text-[#FFF] transition-all cursor-pointer"
                >
                  Bekor qilish
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStartPayment(selectedPackage)}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D4A373] to-[#8C6239] text-[#0A0706] font-bold text-xs shadow-md shadow-[#D4A373]/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Toʻlovga oʻtish</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TO'LOV JARAYONI VA REKVIZITLAR MODALI (CLICK VA PAYME BILAN) */}
      <AnimatePresence>
        {activeOrder && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 overflow-y-auto"
            onClick={() => setActiveOrder(null)}
          >
            <motion.div 
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
              className="bg-gradient-to-b from-[#18110D] via-[#120D0A] to-[#0A0705] border border-[#D4A373]/40 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(212,163,115,0.12)] relative text-left my-auto max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* YOPISH TUGMASI (X) */}
              <button 
                onClick={() => setActiveOrder(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-[#1E1511] border border-[#2E211B] flex items-center justify-center text-[#A89485] hover:text-[#FFF] transition-all cursor-pointer z-10"
                title="Yopish"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Yuqori panel: status va orqaga taymer */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#291E18]/80 pr-8">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <span className="text-xs font-bold text-[#E0A96D] uppercase tracking-wider">Toʻlov kutilmoqda</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono bg-[#1E1511] px-3 py-1 rounded-xl border border-[#D4A373]/20 shadow-inner">
                  <Clock className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                </div>
              </div>

              {/* Aniq to'lov summasi ko'rsatkichi */}
              <div className="mt-3.5 p-3.5 rounded-2xl bg-[#1C1410]/90 border border-[#D4A373]/30 text-center relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4A373]/5 blur-2xl rounded-full pointer-events-none" />
                <p className="text-[10px] text-[#A89485] uppercase tracking-wider font-semibold">Toʻlanishi kerak boʻlgan aniq summa</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-serif font-extrabold text-[#FFF] tracking-tight drop-shadow-[0_2px_10px_rgba(212,163,115,0.25)]">
                    {formatPrice(activeOrder.exactAmount)}
                  </span>
                  <span className="text-sm font-bold text-[#E0A96D]">soʻm</span>
                  <button 
                    onClick={copyAmount}
                    className="p-1.5 rounded-xl bg-[#261A14] hover:bg-[#D4A373]/25 text-[#E0A96D] border border-[#3A2820] hover:border-[#D4A373]/50 transition-all cursor-pointer ml-1 shadow-sm active:scale-95"
                    title="Summani nusxalash"
                  >
                    {amountCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Click QR-kodi */}
              <div className="mt-3 p-3.5 rounded-2xl bg-[#0B0806] border border-[#2A1F1A] flex flex-col items-center justify-center text-center shadow-inner relative group">
                <div className="w-44 h-44 bg-white p-2 rounded-2xl shadow-xl flex items-center justify-center border-2 border-[#D4A373]/40">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=1&data=${encodeURIComponent(CLICK_P2P_URL)}`}
                    alt="Click P2P QR Code" 
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-[#E0A96D] font-medium">
                  <QrCode className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Kamerangiz orqali QR kodni skanerlang</span>
                </div>
              </div>

              {/* Muhim ogohlantirish */}
              <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-amber-500/20 border-2 border-amber-500/70 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.15)] flex items-start gap-3 relative overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center shrink-0 mt-0.5 text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-300 animate-pulse" />
                </div>
                <div className="text-left text-xs leading-relaxed">
                  <p className="font-extrabold text-amber-300 tracking-wide uppercase text-[11px]">
                    ⚠️ MUHIM OGOHLANTIRISH:
                  </p>
                  <p className="mt-0.5 text-amber-100/90 text-[11.5px]">
                    Hisobingizga tangalar avtomatik tarzda tushishi uchun aynan <b className="text-white underline decoration-amber-400 underline-offset-2">{formatPrice(activeOrder.exactAmount)} so‘m</b> to‘lov qiling!
                  </p>
                </div>
              </div>

              {/* Karta rekviziti */}
              <div className="mt-3 bg-[#18110D] border border-[#2D211A] rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#8C7A6B] uppercase font-bold tracking-wider">Qabul qiluvchi karta</p>
                  <p className="text-xs sm:text-sm font-mono font-bold text-[#FBF5F0] tracking-wider mt-0.5">
                    {CARD_NUMBER.replace(/(\d{4})/g, '$1 ').trim()}
                  </p>
                </div>
                <button
                  onClick={copyCard}
                  className="flex items-center gap-1 text-xs text-[#E0A96D] bg-[#241914] px-2.5 py-1.5 rounded-lg border border-[#3A2820] hover:border-[#D4A373]/50 hover:text-[#FFF] transition-all cursor-pointer active:scale-95"
                >
                  {cardCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{cardCopied ? 'Nusxalandi' : 'Nusxa'}</span>
                </button>
              </div>

              {/* TO'LOV ILOVALARINI TANLASH (CLICK VA PAYME) */}
              <div className="mt-3 space-y-2">
                <p className="text-[11px] text-[#A89485] font-medium text-center mb-1">Toʻlov qilish uchun ilovani tanlang:</p>
                
                {/* Click Up tugmasi */}
                <button
                  type="button"
                  onClick={() => {
                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                    if (isMobile) {
                      window.location.href = CLICK_P2P_URL;
                    } else {
                      addToast('warning', 'Kompyuter rejimi', 'Kompyuterda Click ilovasi ishlamaydi! Iltimos, ekrandagi QR kodni telefoningiz orqali skanerlang.');
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0073FF] via-[#0062DB] to-[#0052B8] hover:from-[#0066E6] hover:to-[#004BB0] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all text-center cursor-pointer active:scale-[0.99]"
                >
                  <span>Click Up orqali toʻlash</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                {/* Payme tugmasi */}
                <button
                  type="button"
                  onClick={() => {
                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                    if (isMobile) {
                      window.location.href = PAYME_P2P_URL;
                    } else {
                      addToast('warning', 'Kompyuter rejimi', 'Kompyuterda Payme ilovasi ishlamaydi! Iltimos, ekrandagi QR kodni telefoningiz orqali skanerlang.');
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00A699] via-[#008F83] to-[#007369] hover:from-[#00998D] hover:to-[#006259] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25 transition-all text-center cursor-pointer active:scale-[0.99]"
                >
                  <span>Payme orqali toʻlash</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              {/* Kutish indikatori */}
              <div className="mt-3 pt-2.5 border-t border-[#291E18] flex items-center justify-between text-xs text-[#8C7A6B]">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A373]" />
                  <span>Toʻlov kutilmoqda...</span>
                </div>
                <button 
                  onClick={() => setActiveOrder(null)} 
                  className="text-[#8C7A6B] hover:text-rose-400 underline text-[11px] cursor-pointer"
                >
                  Bekor qilish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MUVAFFAQIYATLI TO'LOV OYNASI */}
      <AnimatePresence>
        {paymentSuccess && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
            onClick={() => setPaymentSuccess(false)}
          >
            <motion.div 
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-[#121A14] border border-emerald-500/50 rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-[0_30px_90px_rgba(16,185,129,0.2)] text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/20">
                <PartyPopper className="w-8 h-8 animate-bounce" />
              </div>

              <h3 className="text-xl font-serif font-bold text-white">
                Toʻlov muvaffaqiyatli!
              </h3>
              
              <p className="mt-2 text-xs text-emerald-200/80 leading-relaxed">
                Hisobingiz muvaffaqiyatli toʻldirildi. Tizim avtomatik tarzda tangalarni faollashtirdi.
              </p>

              <div className="mt-5 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center gap-2">
                <Coins className="w-5 h-5 text-emerald-400" />
                <span className="text-lg font-bold text-white">+{successCoins} tanga qoʻshildi</span>
              </div>

              <button
                onClick={() => setPaymentSuccess(false)}
                className="mt-6 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                Ajoyib, davom etish
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUTENTIFIKATSIYA MODAL OYNASI */}
      <AnimatePresence>
        {showAuthModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl p-4"
            onClick={() => !isAuthLoading && setShowAuthModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
              className="bg-[#120D0A]/95 border border-[#D4A373]/40 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-[0_30px_90px_rgba(0,0,0,0.85)] backdrop-blur-2xl relative text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowAuthModal(false)} 
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#1E1511] border border-[#2E211B] flex items-center justify-center text-[#A89485] hover:text-[#FFF] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#8C6239] flex items-center justify-center text-[#0A0706] mx-auto mb-2.5 shadow-lg shadow-[#D4A373]/20">
                  {authMode === 'login' ? <LogIn className="w-5 h-5 stroke-[2.2]" /> : <UserPlus className="w-5 h-5 stroke-[2.2]" />}
                </div>
                <h3 className="text-xl font-serif font-bold text-[#FBF5F0]">
                  {authMode === 'login' ? 'Akkauntga kirish' : 'Yangi hisob ochish'}
                </h3>
                <p className="text-xs text-[#A89485] mt-0.5">
                  {authMode === 'login' 
                    ? 'Oʻz balansingiz va tahrirlangan fayllaringizni boshqaring' 
                    : 'Hoziroq roʻyxatdan oʻting va +15 tanga bepul oling!'}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {authMode === 'register' && (
                  <div>
                    <label className="text-[11px] font-bold text-[#A89485] uppercase block mb-1">
                      Ismingiz
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Masalan: Sardor Aliyev"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full bg-[#0C0806] border border-[#291E18] focus:border-[#D4A373]/70 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#FBF5F0] placeholder-[#7A6A5E] outline-none transition-all"
                      />
                      <User className="w-4 h-4 text-[#A89485] absolute left-3 top-3" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-[#A89485] uppercase block mb-1">
                    Gmail yoki Telefon raqam
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="example@gmail.com yoki 998901234567"
                      value={authIdentifier}
                      onChange={(e) => setAuthIdentifier(e.target.value)}
                      className="w-full bg-[#0C0806] border border-[#291E18] focus:border-[#D4A373]/70 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#FBF5F0] placeholder-[#7A6A5E] outline-none transition-all"
                    />
                    <Mail className="w-4 h-4 text-[#A89485] absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#A89485] uppercase block mb-1">
                    Parol
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Kamida 6 ta belgi"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-[#0C0806] border border-[#291E18] focus:border-[#D4A373]/70 rounded-xl pl-9 pr-9 py-2.5 text-xs text-[#FBF5F0] placeholder-[#7A6A5E] outline-none transition-all"
                    />
                    <Lock className="w-4 h-4 text-[#A89485] absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#A89485] hover:text-[#D4A373] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
                    {authError}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isAuthLoading}
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4A373] to-[#8C6239] text-[#0A0706] font-bold text-xs sm:text-sm shadow-lg shadow-[#D4A373]/20 mt-2 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isAuthLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Yuklanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <span>{authMode === 'login' ? 'Tizimga kirish' : 'Roʻyxatdan oʻtish'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-4 pt-3 border-t border-[#291E18] text-center text-xs text-[#A89485]">
                {authMode === 'login' ? (
                  <p>
                    Akkauntingiz yoʻqmi?{' '}
                    <button 
                      type="button"
                      onClick={() => { setAuthMode('register'); setAuthError(''); }} 
                      className="text-[#D4A373] font-bold hover:underline ml-1 cursor-pointer"
                    >
                      Roʻyxatdan oʻtish
                    </button>
                  </p>
                ) : (
                  <p>
                    Allaqachon hisobingiz bormi?{' '}
                    <button 
                      type="button"
                      onClick={() => { setAuthMode('login'); setAuthError(''); }} 
                      className="text-[#D4A373] font-bold hover:underline ml-1 cursor-pointer"
                    >
                      Tizimga kirish
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}