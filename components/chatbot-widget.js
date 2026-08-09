(function () {
    'use strict';

    /**
     * Static chatbot widget — Shadow DOM isolated, no AI backend.
     * Customize CONFIG, QUICK_REPLIES, and RESPONSES below.
     */

    const CONFIG = {
        title: 'Support',
        subtitle: 'Typically replies instantly',
        welcome: "Hi there! I'm here to help. Ask a question or pick an option below.",
        placeholder: 'Type a message…',
    };

    const QUICK_REPLIES = [
        { label: 'Our services', key: 'services' },
        { label: 'Portfolio', key: 'portfolio' },
        { label: 'Get in touch', key: 'contact' },
        { label: 'Pricing', key: 'pricing' },
        { label: 'About us', key: 'about' },
    ];

    const RESPONSES = {
        services: 'We offer Web Development, Payment & Checkout Solutions, Automation & Intelligence, Performance & Optimization, Security & Maintenance, and Local Visibility & Content. Visit the Services page for the full breakdown.',
        portfolio: 'The Portfolio page has sample sites — e-commerce, local business, SaaS, and studio work. Open it to see the kind of builds I deliver for clients.',
        contact: 'Reach out at info@company.com or +1 (800) 555-1234. You can also fill out the form on the Contact page — I reply within one business day.',
        pricing: 'Every project is scoped individually based on your needs. Head to the Contact page and we\'ll put together a clear quote.',
        about: 'I\'m a solo developer — you work directly with the person building your project. No hand-offs, no agency overhead. Check the About page to learn more.',
        hello: 'Hello! How can I help you today?',
        thanks: 'You\'re welcome! Let me know if there\'s anything else.',
        default: 'Good question. For anything detailed, visit the Contact page or try one of the quick options below.',
    };

    const KEYWORDS = [
        { match: /\b(hi|hello|hey|howdy)\b/i, key: 'hello' },
        { match: /\b(service|offer|do you do|what do you)\b/i, key: 'services' },
        { match: /\b(portfolio|work|projects?|examples?|showcase)\b/i, key: 'portfolio' },
        { match: /\b(contact|email|phone|reach|call)\b/i, key: 'contact' },
        { match: /\b(price|pricing|cost|quote|how much)\b/i, key: 'pricing' },
        { match: /\b(about|who are you|team|developer)\b/i, key: 'about' },
        { match: /\b(thank|thanks|thx)\b/i, key: 'thanks' },
    ];

    function getResponse(text) {
        for (const { match, key } of KEYWORDS) {
            if (match.test(text)) return RESPONSES[key];
        }
        return RESPONSES.default;
    }

    function createWidget() {
        const host = document.createElement('div');
        host.setAttribute('id', 'site-chatbot-host');
        document.body.appendChild(host);

        const shadow = host.attachShadow({ mode: 'open' });

        shadow.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                :host {
                    all: initial;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }

                .launcher {
                    position: fixed;
                    bottom: 1.5rem;
                    right: 1.5rem;
                    z-index: 99999;
                    width: 3.5rem;
                    height: 3.5rem;
                    border-radius: 50%;
                    background: #02457C;
                    border: 1px solid rgba(255, 255, 255, 0.35);
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
                    transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
                }

                .launcher:hover {
                    transform: scale(1.05);
                    border-color: rgba(255, 255, 255, 0.6);
                    background: #035a96;
                }

                .launcher svg { width: 1.4rem; height: 1.4rem; }

                .launcher .icon-close { display: none; }

                .launcher[aria-expanded="true"] .icon-chat { display: none; }
                .launcher[aria-expanded="true"] .icon-close { display: block; }

                .panel {
                    position: fixed;
                    bottom: 5.75rem;
                    right: 1.5rem;
                    z-index: 99998;
                    width: 22rem;
                    max-width: calc(100vw - 2rem);
                    height: 28rem;
                    max-height: calc(100vh - 7rem);
                    background: #02457C;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 0.75rem;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(0.75rem) scale(0.98);
                    transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s;
                }

                .panel.open {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0) scale(1);
                }

                .header {
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
                    flex-shrink: 0;
                }

                .header-title {
                    font-size: 0.9375rem;
                    font-weight: 600;
                    color: #fff;
                    line-height: 1.3;
                }

                .header-sub {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.55);
                    margin-top: 0.15rem;
                }

                .messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    scroll-behavior: smooth;
                }

                .messages::-webkit-scrollbar { width: 4px; }
                .messages::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 2px;
                }

                .msg {
                    max-width: 88%;
                    font-size: 0.8125rem;
                    line-height: 1.5;
                    padding: 0.625rem 0.875rem;
                    border-radius: 0.625rem;
                    word-wrap: break-word;
                }

                .msg-bot {
                    align-self: flex-start;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    color: rgba(255, 255, 255, 0.92);
                }

                .msg-user {
                    align-self: flex-end;
                    background: #fff;
                    color: #02457C;
                    font-weight: 500;
                }

                .typing {
                    align-self: flex-start;
                    display: flex;
                    gap: 0.3rem;
                    padding: 0.75rem 1rem;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 0.625rem;
                }

                .typing.hidden { display: none; }

                .typing span {
                    width: 0.35rem;
                    height: 0.35rem;
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 50%;
                    animation: bounce 1.2s infinite ease-in-out;
                }

                .typing span:nth-child(2) { animation-delay: 0.15s; }
                .typing span:nth-child(3) { animation-delay: 0.3s; }

                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-4px); opacity: 1; }
                }

                .quick-replies {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.4rem;
                    padding: 0 1.25rem 0.75rem;
                    flex-shrink: 0;
                }

                .quick-replies.hidden { display: none; }

                .quick-btn {
                    font-family: inherit;
                    font-size: 0.75rem;
                    padding: 0.4rem 0.75rem;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.85);
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    border-radius: 9999px;
                    cursor: pointer;
                    transition: background 0.15s ease, border-color 0.15s ease;
                }

                .quick-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.45);
                }

                .input-area {
                    display: flex;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.15);
                    flex-shrink: 0;
                }

                .input-area input {
                    flex: 1;
                    font-family: inherit;
                    font-size: 0.8125rem;
                    padding: 0.55rem 0.75rem;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 0.5rem;
                    color: #fff;
                    outline: none;
                    transition: border-color 0.15s ease;
                }

                .input-area input::placeholder { color: rgba(255, 255, 255, 0.45); }

                .input-area input:focus {
                    border-color: rgba(255, 255, 255, 0.45);
                }

                .send-btn {
                    font-family: inherit;
                    font-size: 0.8125rem;
                    font-weight: 500;
                    padding: 0.55rem 0.875rem;
                    background: #fff;
                    color: #02457C;
                    border: none;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: opacity 0.15s ease;
                    flex-shrink: 0;
                }

                .send-btn:hover { opacity: 0.9; }
                .send-btn:disabled { opacity: 0.45; cursor: not-allowed; }

                @media (max-width: 480px) {
                    .launcher { bottom: 1rem; right: 1rem; }
                    .panel {
                        right: 1rem;
                        bottom: 5.25rem;
                        width: calc(100vw - 2rem);
                        height: calc(100vh - 6.5rem);
                        max-height: none;
                    }
                }
            </style>

            <div class="panel" id="panel" role="dialog" aria-label="Chat support" aria-hidden="true">
                <div class="header">
                    <div class="header-title">${CONFIG.title}</div>
                    <div class="header-sub">${CONFIG.subtitle}</div>
                </div>
                <div class="messages" id="messages"></div>
                <div class="typing hidden" id="typing" aria-hidden="true">
                    <span></span><span></span><span></span>
                </div>
                <div class="quick-replies" id="quick-replies"></div>
                <form class="input-area" id="form">
                    <input type="text" id="input" placeholder="${CONFIG.placeholder}" autocomplete="off" maxlength="500" />
                    <button type="submit" class="send-btn" id="send">Send</button>
                </form>
            </div>

            <button class="launcher" id="launcher" aria-label="Open chat" aria-expanded="false" aria-controls="panel">
                <svg class="icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        `;

        return {
            shadow,
            launcher: shadow.getElementById('launcher'),
            panel: shadow.getElementById('panel'),
            messages: shadow.getElementById('messages'),
            typing: shadow.getElementById('typing'),
            quickReplies: shadow.getElementById('quick-replies'),
            form: shadow.getElementById('form'),
            input: shadow.getElementById('input'),
            send: shadow.getElementById('send'),
        };
    }

    function init() {
        const ui = createWidget();
        let isOpen = false;
        let hasWelcomed = false;

        function scrollToBottom() {
            ui.messages.scrollTop = ui.messages.scrollHeight;
        }

        function addMessage(text, type) {
            const el = document.createElement('div');
            el.className = `msg msg-${type}`;
            el.textContent = text;
            ui.messages.appendChild(el);
            scrollToBottom();
        }

        function renderQuickReplies() {
            ui.quickReplies.innerHTML = '';
            QUICK_REPLIES.forEach(({ label, key }) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'quick-btn';
                btn.textContent = label;
                btn.addEventListener('click', () => handleUserMessage(label, key));
                ui.quickReplies.appendChild(btn);
            });
            ui.quickReplies.classList.remove('hidden');
        }

        function showTyping() {
            ui.typing.classList.remove('hidden');
            scrollToBottom();
        }

        function hideTyping() {
            ui.typing.classList.add('hidden');
        }

        function botReply(text) {
            showTyping();
            ui.send.disabled = true;

            setTimeout(() => {
                hideTyping();
                addMessage(text, 'bot');
                renderQuickReplies();
                ui.send.disabled = false;
                ui.input.focus();
            }, 600 + Math.random() * 400);
        }

        function handleUserMessage(displayText, responseKey) {
            addMessage(displayText, 'user');
            ui.quickReplies.classList.add('hidden');

            const reply = responseKey
                ? RESPONSES[responseKey] || RESPONSES.default
                : getResponse(displayText);

            botReply(reply);
        }

        function togglePanel(open) {
            isOpen = open ?? !isOpen;
            ui.panel.classList.toggle('open', isOpen);
            ui.panel.setAttribute('aria-hidden', String(!isOpen));
            ui.launcher.setAttribute('aria-expanded', String(isOpen));
            ui.launcher.setAttribute('aria-label', isOpen ? 'Close chat' : 'Open chat');

            if (isOpen) {
                if (!hasWelcomed) {
                    hasWelcomed = true;
                    addMessage(CONFIG.welcome, 'bot');
                    renderQuickReplies();
                }
                ui.input.focus();
            }
        }

        ui.launcher.addEventListener('click', () => togglePanel());

        ui.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = ui.input.value.trim();
            if (!text) return;
            ui.input.value = '';
            handleUserMessage(text);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) togglePanel(false);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
