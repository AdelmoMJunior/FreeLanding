export function WhatsappFloating() {
  return (
    <a
      href="#contato"
      className="fixed bottom-5 right-5 z-20 inline-flex size-14 items-center justify-center rounded-full bg-[#128c4a] text-white shadow-2xl shadow-emerald-950/30 transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 sm:bottom-7 sm:right-7"
      aria-label="Ir para contato pelo WhatsApp"
      title="WhatsApp"
    >
      <svg aria-hidden="true" viewBox="0 0 32 32" className="size-7" fill="currentColor">
        <path d="M16.04 3.2A12.72 12.72 0 0 0 5.18 22.55L3.6 28.8l6.39-1.5A12.75 12.75 0 1 0 16.04 3.2Zm0 23.18c-2.02 0-3.9-.58-5.5-1.6l-.39-.25-3.78.89 1-3.67-.26-.4a10.29 10.29 0 1 1 8.93 5.03Zm5.97-7.7c-.33-.17-1.94-.96-2.24-1.07-.3-.11-.52-.17-.74.17-.22.33-.85 1.07-1.05 1.29-.19.22-.39.25-.72.08-.33-.17-1.39-.51-2.65-1.63-.98-.87-1.64-1.95-1.83-2.28-.19-.33-.02-.51.15-.68.15-.15.33-.39.5-.58.17-.19.22-.33.33-.55.11-.22.06-.42-.03-.58-.08-.17-.74-1.78-1.02-2.44-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.58.08-.88.42-.3.33-1.16 1.13-1.16 2.76 0 1.63 1.19 3.2 1.35 3.42.17.22 2.34 3.57 5.67 5 .79.34 1.41.54 1.89.69.79.25 1.51.22 2.08.13.64-.1 1.94-.79 2.22-1.55.27-.76.27-1.41.19-1.55-.08-.14-.3-.22-.63-.39Z" />
      </svg>
    </a>
  );
}
