/**
 * Model Brand Icons
 * SVG icons for ChatGPT, Claude, and Perplexity
 */

export const ChatGPTIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.2819 9.8211C23.0419 10.6211 23.0419 11.8611 22.2819 12.6611L13.2819 21.6611C12.4819 22.4211 11.2419 22.4211 10.4419 21.6611L1.44189 12.6611C0.681891 11.8611 0.681891 10.6211 1.44189 9.8211L10.4419 0.821094C11.2419 0.0610937 12.4819 0.0610937 13.2819 0.821094L22.2819 9.8211Z"
      fill="currentColor"
      opacity="0.3"
    />
    <circle cx="12" cy="12" r="5" fill="currentColor" />
  </svg>
);

export const ClaudeIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4ZM9 8C8.45 8 8 8.45 8 9V15C8 15.55 8.45 16 9 16C9.55 16 10 15.55 10 15V9C10 8.45 9.55 8 9 8ZM15 8C14.45 8 14 8.45 14 9V15C14 15.55 14.45 16 15 16C15.55 16 16 15.55 16 15V9C16 8.45 15.55 8 15 8Z"
      fill="currentColor"
    />
  </svg>
);

export const PerplexityIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L2 7L12 12L22 7L12 2Z"
      fill="currentColor"
      opacity="0.5"
    />
    <path
      d="M2 17L12 22L22 17V12L12 17L2 12V17Z"
      fill="currentColor"
    />
    <path
      d="M12 12L2 7V12L12 17L22 12V7L12 12Z"
      fill="currentColor"
      opacity="0.7"
    />
  </svg>
);
