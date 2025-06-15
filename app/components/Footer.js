import { SocialIcon } from "react-social-icons";

export default function Footer() {
  return (
    <footer className="bg-white text-center py-1 mt-2 border-t border-gray-200 text-base flex flex-col items-center">
      <div className="flex justify-center gap-4" style={{ marginBottom: 2 }}>
        <SocialIcon
          url="mailto:h164654156465@gmail.com"
          style={{ height: 28, width: 28 }}
        />
        <SocialIcon
          url="https://github.com/7xuanlu"
          style={{ height: 28, width: 28 }}
        />
        <SocialIcon
          url="https://www.youtube.com/@7xuan.studio"
          style={{ height: 28, width: 28 }}
        />
        <SocialIcon
          url="https://www.linkedin.com/in/lu-qixuan/"
          style={{ height: 28, width: 28 }}
        />
        <SocialIcon
          url="https://www.instagram.com/7xuan.studio/"
          style={{ height: 28, width: 28 }}
        />
      </div>
      <div className="text-gray-500 text-sm" style={{ marginBottom: 2 }}>
        Lucian &nbsp; &copy; 2025 &nbsp; &bull; &nbsp;
        <a
          href="https://lucian-site-gilt.vercel.app/"
          className="hover:underline"
        >
          lucian.co
        </a>
      </div>
      <div className="text-gray-400 text-sm">Tailwind Nextjs Theme</div>
    </footer>
  );
}
