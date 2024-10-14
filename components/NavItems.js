"use client";
import React, { useEffect, useState } from "react";
import { ArrowSmUpIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";

const NavItems = () => {
	const router = useRouter();
	const SWAP = "Swap";
	const POOL = "Pool";
	const BRIDGE = "Bridge";
	const CHART = "Exchange";

	const [selectedNavItem, setSelectedNavItem] = useState(SWAP);

	const handleNavigate = (route) => () => {
		setSelectedNavItem(route);
		router.push(route.toLowerCase());
	};

	useEffect(() => {
		setSelectedNavItem(
			router.pathname.substring(1).charAt(0).toUpperCase() +
				router.pathname.substring(2)
		);
	}, [router.pathname]);

	return (
		<div
			style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
			className='bg-transparent h-fit flex items-center justify-around rounded-full w-full overflow-auto text-white '
		>
			<p className={getNavIconClassName(SWAP)} onClick={handleNavigate(SWAP)}>
				{SWAP}
			</p>
			<p className={getNavIconClassName(POOL)} onClick={handleNavigate(POOL)}>
				{POOL}
			</p>
			{/* <p
				className={getNavIconClassName(BRIDGE)}
				onClick={handleNavigate(BRIDGE)}
			>
				{BRIDGE}
			</p> */}
			<p
				className={getNavIconClassName(CHART)}
				onClick={() => window.open("https://openvino.exchange", "_blank")}
			>
				{CHART}
				<ArrowSmUpIcon className='h-4 rotate-45' />
			</p>
		</div>
	);

	function getNavIconClassName(name) {
		let className =
			"p-1 px-2 cursor-pointer border-[4px] border-transparent flex items-center text-white";
		className +=
			name === selectedNavItem
				? " bg-zinc-800 border-zinc-900 rounded-full"
				: "";
		return className;
	}
};

export default NavItems;
