import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Mainlayout({children}) {
    return (
            <>
                <Navbar />
                    <main>
                        {children}
                    </main>
                <Footer />
            </>
        );
}

export default Mainlayout;