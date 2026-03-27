import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Script from 'next/script'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'NodeFlow | Institutional Liquidity Hub & Yield Protocol',
  description: 'Decentralized flow node optimization and strategic institutional liquidity verification.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-[#0F172A]" suppressHydrationWarning={true}>
        <AuthProvider>
          <SettingsProvider>
            <CurrencyProvider>
              <LanguageProvider>
                {children}
                <Toaster position="top-center" richColors />
                <Analytics />
                
                {/* TAWK.TO LIVE CHAT PROTOCOL */}
                <Script id="tawk-to" strategy="lazyOnload">
                  {`
                    var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                    Tawk_API.onLoad = function() {
                      Tawk_API.hideWidget();
                    };
                    (function(){
                    var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                    s1.async=true;
                    s1.src='https://embed.tawk.to/69c441ae5b8e4d1c398bb6e2/1jkja14p1';
                    s1.charset='UTF-8';
                    s1.setAttribute('crossorigin','*');
                    s0.parentNode.insertBefore(s1,s0);
                    })();
                  `}
                </Script>
              </LanguageProvider>
            </CurrencyProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
