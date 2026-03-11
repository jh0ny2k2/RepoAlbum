import React, { useState } from 'react';
import { useLanguageStore } from '@/store/language';
import { ChevronDown, ChevronUp, Send, MessageCircle, BookOpen, Loader2, Menu, X } from 'lucide-react';
import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';

export default function Support() {
  const { t, language, setLanguage } = useLanguageStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Contact Form State
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const faqs = [
    {
      question: t('faq_1_q'),
      answer: t('faq_1_a')
    },
    {
      question: t('faq_2_q'),
      answer: t('faq_2_a')
    },
    {
      question: t('faq_3_q'),
      answer: t('faq_3_a')
    },
    {
      question: t('faq_4_q'),
      answer: t('faq_4_a')
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
        // Use our existing send-email function
        await fetch('https://maoxewgqbagqglqckluw.supabase.co/functions/v1/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: 'chavesnano@gmail.com', // Support email
                subject: `New Support Request from ${form.name}`,
                html: `
                  <h3>New Support Request</h3>
                  <p><strong>Name:</strong> ${form.name}</p>
                  <p><strong>Email:</strong> ${form.email}</p>
                  <p><strong>Message:</strong></p>
                  <p>${form.message}</p>
                `
            })
        });
        setSent(true);
        setForm({ name: '', email: '', message: '' });
    } catch (err) {
        console.error(err);
        alert('Failed to send message. Please try again.');
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <SEO 
        title={`${t('support_title')} | Lumina Support`}
        description={t('support_subtitle')}
      />

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-serif font-bold tracking-tighter">Lumina</Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs font-bold tracking-widest px-3 py-1.5 rounded-full bg-gray-100/50 border border-gray-200">
                <button onClick={() => setLanguage('en')} className={language === 'en' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}>EN</button>
                <span className="text-gray-300">|</span>
                <button onClick={() => setLanguage('es')} className={language === 'es' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}>ES</button>
            </div>
             <Link to="/login" className="text-sm font-medium hover:text-rose-600 transition-colors">{t('login')}</Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-500 hover:text-gray-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-6 animate-in slide-in-from-top-5 shadow-xl">
             <div className="flex items-center justify-center gap-4 text-sm font-bold tracking-widest bg-gray-50 p-2 rounded-xl border border-gray-100">
                <button onClick={() => setLanguage('en')} className={language === 'en' ? 'text-gray-900' : 'text-gray-400'}>English</button>
                <span className="text-gray-300">|</span>
                <button onClick={() => setLanguage('es')} className={language === 'es' ? 'text-gray-900' : 'text-gray-400'}>Español</button>
             </div>
             
             <div className="flex flex-col gap-3">
                <Link to="/login" className="w-full border border-gray-200 py-3 rounded-xl font-bold text-center hover:bg-gray-50 text-gray-700">
                   {t('login')}
                </Link>
             </div>
          </div>
        )}
      </nav>

      <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        
        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">{t('support_title')}</h1>
            <p className="text-xl text-gray-500">{t('support_subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
            
            {/* FAQs */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <BookOpen className="w-6 h-6 text-rose-500" />
                    <h2 className="text-2xl font-bold">{t('faq_title')}</h2>
                </div>
                
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
                            <button 
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-gray-50 transition-colors"
                            >
                                {faq.question}
                                {openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </button>
                            {openFaq === i && (
                                <div className="p-4 pt-0 text-gray-500 text-sm leading-relaxed bg-gray-50/50">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Form */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <MessageCircle className="w-6 h-6 text-rose-500" />
                    <h2 className="text-2xl font-bold">{t('contact_title')}</h2>
                </div>

                {sent ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-8 rounded-2xl text-center">
                        <h3 className="text-xl font-bold mb-2">{t('message_sent')}</h3>
                        <p>{t('message_sent_desc')}</p>
                        <button onClick={() => setSent(false)} className="mt-4 text-sm font-bold underline">{t('send_another')}</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('label_name')}</label>
                            <input 
                                type="text" 
                                required 
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                                placeholder="Your name"
                                value={form.name}
                                onChange={e => setForm({...form, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('label_email')}</label>
                            <input 
                                type="email" 
                                required 
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                                placeholder="your@email.com"
                                value={form.email}
                                onChange={e => setForm({...form, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('label_message')}</label>
                            <textarea 
                                required 
                                rows={4}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                                placeholder={t('leave_message')}
                                value={form.message}
                                onChange={e => setForm({...form, message: e.target.value})}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={sending}
                            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {t('btn_send')}
                        </button>
                    </form>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}