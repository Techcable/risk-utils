"use client";

// disables server-side rendering
import dynamic from "next/dynamic";

const App = dynamic(() => import("../../App"), { ssr: false });

export function ClientOnly() {
    return <App />;
}
