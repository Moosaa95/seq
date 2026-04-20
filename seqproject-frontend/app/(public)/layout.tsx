import FloatingContact from "@/components/FloatingContact";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>
        <Navigation />
        {children}
        <Footer />
        <FloatingContact />
    </>;
}