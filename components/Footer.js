import { FaInstagram, FaLinkedin, FaGlobe } from "react-icons/fa";

const socials = [
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaLinkedin, href: "#", label: "LinkedIn" },
  { icon: FaGlobe, href: "#", label: "Website" },
];

const Footer = () => {
  return (
    <footer className="w-full mt-24 pb-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-8" />

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/openvino-logo.png" alt="OpenVino" className="h-8 opacity-80" />
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-[#840c4a] text-zinc-400 hover:text-white transition-all duration-200"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} OpenVino. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
