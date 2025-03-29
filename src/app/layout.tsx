import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    title: "Risk Utils",
};
export const viewport: Viewport = {
    themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                {/* TODO: Is noscript meaningful in jsx? */}
                <noscript>You need to enable JavaScript to run this app.</noscript>
                <div id="root">{children}</div>
            </body>
        </html>
    );
}
