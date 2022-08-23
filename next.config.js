module.exports = () => {
	const env = {
		NEXT_PUBLIC_OPENQ_PROXY_ADDRESS: process.env.OPENQ_PROXY_ADDRESS,
		NEXT_PUBLIC_DEPOSIT_MANAGER_PROXY_ADDRESS: process.env.DEPOSIT_MANAGER_PROXY_ADDRESS,
		NEXT_PUBLIC_DEPLOY_ENV: process.env.DEPLOY_ENV,
		NEXT_PUBLIC_SUPERFLUID_RESOLVER_ADDRESS: process.env.SUPERFLUID_RESOLVER_ADDRESS,
		NEXT_PUBLIC_FDAIX_ADDRESS: process.env.FDAIX_ADDRESS,
		NEXT_PUBLIC_INFURA_KEY: process.env.INFURA_KEY,
		NEXT_PUBLIC_BASE_URL: process.env.BASE_URL,
		NEXT_PUBLIC_AUTH_URL: process.env.AUTH_URL,
		NEXT_PUBLIC_OPENQ_API_URL: process.env.OPENQ_API_URL,
		NEXT_PUBLIC_ORACLE_URL: process.env.ORACLE_URL,
		NEXT_PUBLIC_GITHUB_BOT_WEBHOOK: process.env.GITHUB_BOT_WEBHOOK,
		NEXT_PUBLIC_COIN_API_URL: process.env.COIN_API_URL,
		NEXT_PUBLIC_PATS: process.env.PATS,
		NEXT_PUBLIC_OPENQ_ID: process.env.OPENQ_ID,
		NEXT_PUBLIC_BLOCK_EXPLORER_BASE_URL: process.env.BLOCK_EXPLORER_BASE_URL,
		NEXT_PUBLIC_OPENQ_SUBGRAPH_HTTP_URL: process.env.OPENQ_SUBGRAPH_HTTP_URL,
		NEXT_PUBLIC_SUPERFLUID_SUBGRAPH_HTTP_URL: process.env.SUPERFLUID_SUBGRAPH_HTTP_URL,
		NEXT_PUBLIC_GA_TRACKING_ID: process.env.GA_TRACKING_ID,
		NEXT_PUBLIC_INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID
	};

	const config = {
		reactStrictMode: true,
		env,
		images: {
			domains: [
				'githubusercontent.com',
				'assets.coingecko.com',
				'avatars.githubusercontent.com',
				'raw.githubusercontent.com',
				'cryptologos.cc',
				'wallet-asset.matic.network',
				'polygonscan.com',
				'etherscan.io',
				'gateway.pinata.cloud',
				'svgshare.com',
				'coinpoker.com',
				'i.imgur.com',
				'github.com',
				'btu-protocol.com',
				'img.ex-sports.io',
				'pruf.io',
				'arch-finance-basket-logos.s3.amazonaws.com',
				'images.ctfassets.net',
				'www.uct-token.org',
				'www.dropbox.com',
				's2.coinmarketcap.com',
				'www.fleato.com',
				'cdn.efinity.io',
				'cryptopia.com',
				'cryptopia.com',
				'app.insurace.io',
				'd26jz7p3kula4l.cloudfront.net',
				'i.ibb.co',
				'crazydefenseheroes.com',
				'insuretoken.net',
				'arweave.net',
				'drive.google.com',
				'www.germoney.cash',
				'www.lepasa.com',
				'app.civfund.org',
				'minatodao.com',
				'bafkreiawezzhlphckhopkolrkxsz4mtayjz4cjxz4bgsvvkjsclqacf2be.ipfs.nftstorage.link',
				'www.theranosco.in',
				'uploads-ssl.webflow.com',
				'changenow.io',
				'navcoin.org',
				'miguelpiedrafita.com',
				'deversifi.com',
				'user-images.githubusercontent.com',
				'1planet.app',
				'gateway.ipfs.io',
				'cdn.coinranking.com',
				'www.ludenaprotocol.io',
				's.ozys.io'







			],
		}
	};

	return config;
};
