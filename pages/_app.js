import { useEffect, useState } from "react";
import "../styles/globals.css";

import { ThirdwebProvider } from "thirdweb/react";
import Modal from "react-modal";

Modal.setAppElement("#__next");

function MyApp({ Component, pageProps }) {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);
	if (!isClient) {
		return null; //loader
	}

	return (
		<ThirdwebProvider>
			{/* Aseguramos que todo el contenido esté dentro de un contenedor flex con min-h-screen */}
			<div className='flex flex-col min-h-screen  mb-10'>
				{/* El contenido crecerá para ocupar el espacio disponible */}
				<div className='flex-grow'>
					<Component {...pageProps} />
				</div>
			</div>
		</ThirdwebProvider>
	);
}

export default MyApp;
