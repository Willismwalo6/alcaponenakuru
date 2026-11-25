import { whatsappLink } from "@/lib/site";

export default function WhatsAppFloat({ whatsapp }: { whatsapp: string }) {
  return (
    <a
      href={whatsappLink(whatsapp, "Hello Al Capone, I'd like to make an enquiry.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Al Capone on WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex items-center gap-2 border border-champagne/20 bg-ink/90 px-4 py-3 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-champagne backdrop-blur transition-colors hover:border-champagne/60 hover:bg-graphite md:bottom-8 md:right-8"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.2 5.07 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35zM12.04 21.5h-.01a9.4 9.4 0 01-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.37 9.37 0 01-1.44-5A9.44 9.44 0 0118.7 5.3a9.35 9.35 0 012.76 6.66 9.44 9.44 0 01-9.42 9.54zM20.52 3.48A11.72 11.72 0 0012.04.01C5.52.01.21 5.32.21 11.84c0 2.08.54 4.11 1.57 5.9L.1 24l6.4-1.68a11.8 11.8 0 005.54 1.41h.01c6.51 0 11.82-5.31 11.82-11.83 0-3.16-1.23-6.13-3.35-8.42z" />
      </svg>
      WhatsApp
    </a>
  );
}
