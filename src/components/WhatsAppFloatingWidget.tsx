import React, { useState } from 'react';
import { MessageCircle, X, Send, CheckCheck, Sparkles } from 'lucide-react';

export const WhatsAppFloatingWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('');

  const quickQuestions = [
    'Quero saber sobre os portes e prazos de envio 📦',
    'Como pagar através de MB WAY? 💳',
    'Os sneakers incluem caixa e certificado original? 🛡️',
    'Gostaria de saber se têm o meu tamanho disponível 👟'
  ];

  const handleSendMessage = (msg: string) => {
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/351934755363?text=${encoded}`, '_blank');
    setUserMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Popover Chat Window */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden text-black animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-[#0E0E0E] p-4 text-white flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#FFDD00] border-2 border-[#0E0E0E]" />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight">KICKS CLUB Suporte</h4>
                <span className="text-[10px] text-[#FFDD00] font-semibold flex items-center gap-1">
                  ● Online • Resposta em &lt; 5 min
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="p-4 bg-[#ECE5DD] space-y-3 max-h-72 overflow-y-auto text-xs">
            {/* KicksClub Welcome Bubble */}
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] space-y-1">
              <p className="font-semibold text-neutral-900">
                Olá! 👋 Bem-vindo ao <strong className="text-black">KicksClub.pt</strong>.
              </p>
              <p className="text-neutral-700">
                Como podemos ajudar com os teus sneakers ou encomenda hoje?
              </p>
              <div className="flex items-center justify-end gap-1 text-[9px] text-neutral-400 pt-1">
                <span>Agora</span>
                <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
              </div>
            </div>

            {/* Quick Question Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-neutral-600">Perguntas Rápidas:</span>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="w-full text-left p-2 rounded-xl bg-white/90 hover:bg-white text-neutral-800 text-[11px] font-medium shadow-xs border border-neutral-200 transition-colors flex items-center justify-between group"
                >
                  <span className="line-clamp-1">{q}</span>
                  <span className="text-[#65A30D] group-hover:translate-x-0.5 transition-transform">➔</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-neutral-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (userMessage.trim()) {
                  handleSendMessage(userMessage);
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Escreve uma mensagem..."
                className="flex-1 bg-neutral-100 border border-neutral-300 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-green-600"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <a
              href="https://wa.me/351934755363?text=Ol%C3%A1%20Kicks%20Club!"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-center block text-[10px] font-bold text-green-700 hover:underline"
            >
              Abrir WhatsApp direto (+351 934 755 363)
            </a>
          </div>

        </div>
      )}

      {/* Floating Circle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl shadow-green-600/40 hover:scale-110 active:scale-95 transition-all duration-300 group"
        aria-label="Abrir chat WhatsApp"
      >
        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 fill-current group-hover:rotate-6 transition-transform" />
        
        {/* Red "1" notification badge matching screenshot */}
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md">
          1
        </span>
      </button>

    </div>
  );
};
