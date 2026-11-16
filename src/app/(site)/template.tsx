/** Re-mounts on every navigation: the page content fades in (design: main.js page fade). */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
