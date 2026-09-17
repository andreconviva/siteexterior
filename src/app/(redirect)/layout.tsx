import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Conviva",
  description: "Contemporary residences on the coast of Niteroi, Brazil.",
  icons: { icon: "/images/logo.png" },
};

export default function RedirectLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}<script type="text/javascript" dangerouslySetInnerHTML={{ __html: `(function(){function loadScript(url,callback){var script=document.createElement('script');script.type='text/javascript',script.readyState?script.onreadystatechange=function(){(script.readyState=='loaded'||script.readyState=='complete')&&(script.onreadystatechange=null,callback());}:script.onload=function(){callback();},script.src=url,document.getElementsByTagName('head')[0].appendChild(script);}loadScript('https://cdn.appfacilita.com/static/plugins/jquery.form-tracker.min.js?v=1.5',function(){facilitaFormTrackerFnc({i:'convivaengenharia'});});}());` }} /></body></html>;
}
