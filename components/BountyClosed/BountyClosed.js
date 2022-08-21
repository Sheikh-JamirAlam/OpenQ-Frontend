// Third party
import React, { useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import StoreContext from '../../store/Store/StoreContext';
import useGetTokenValues from '../../hooks/useGetTokenValues';

const BountyClosed = ({ bounty, showTweetLink }) => {

	const [appState] = useContext(StoreContext);
	const [tokenValues] = useGetTokenValues(bounty?.bountyTokenBalances || []);
	const TVL = tokenValues != null && tokenValues != {}
		? appState.utils.formatter.format(tokenValues.total)
		: appState.utils.formatter.format(0);
	// Hooks
	const tweetText = `💸 Just claimed a developer bounty from ${bounty.owner} on OpenQ for ${TVL} working on this issue: `;
	const url = `${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_BASE_URL}/tx/${bounty.claimedTransactionHash}`;

	//Render
	return (
		<div className='flex w-full px-2 sm:px-8 flex-wrap max-w-[1200px] pb-8 mx-auto'>
			<div className='flex-1 pr-4 min-w-[260px] space-y-4 pt-2'>
				<h2 className="flex text-3xl">This contract is closed.</h2>
				<h3 className="flex text-2xl border-b border-gray-700 pb-4">You cannot initiate actions on a closed contract.</h3>
				<div className="flex border-b border-web-gray py-3 gap-2">
					<div className='font-semibold text-muted'>Linked Closing Transaction</div>
					<div className='flex gap-1 text-primary'>
						<Link href={url}>
							<a target={'_blank'} rel="noopener norefferer" className="flex items-center gap-1 underline">
								<div id={'bounty-link'} className="flex cursor-pointer items-center">
									<Image src="/BountyMaterial/polyscan-white.png" width={18} height={18} />
								</div>
								<span className="underline pl-1">view here</span>
							</a>
						</Link>
					</div>
				</div>

				<div className='flex flex-col border-b border-web-gray py-3 gap-2'>
					{bounty?.prs?.some(pr => pr.source['__typename'] === 'PullRequest' && pr.source.url) > 0 ? <>

						<div className='font-semibold text-muted'>Linked Pull Requests</div>
						{bounty.prs.filter((pr) => {
							return pr.source['__typename'] === 'PullRequest' && pr.source.url;
						}).map((pr, index) => {
							if (pr.source['__typename'] === 'PullRequest' && pr.source.url) {
								return <div className='flex gap-1 text-primary' key={index}>
									<Link href={pr.source.url}>
										<a target="_blank" className={'flex items-center gap-1 underline'}>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="18"
												height="18"
												viewBox="0 0 24 24"
												fill="white"
											>
												<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
											</svg>
											{pr.source.title}
										</a>
									</Link>
									<span>
										{pr.source.merged ? ' (merged)' : ' (not merged)'}</span>
								</div>;
							}
						})}
					</> : <span className='font-semibold text-muted'>No linked pull requests</span>}
				</div>

				{showTweetLink &&
					<div className='flex items-center border-b border-web-gray py-3 gap-4'>
						<div className='font-semibold text-muted'>Tweet about it</div>
						<Link href={`https://twitter.com/intent/tweet/?text=${tweetText}${process.env.NEXT_PUBLIC_BASE_URL}/bounty/${bounty.bountyId}/${bounty.bountyAddress}`}>
							<a className="hover:scale-105 animate-single-bounce duration-100" target="_blank" rel="noopener noreferrer">
								<svg viewBox="0 0 128 128" width="18" height="18">
									<path d="M40.254 127.637c48.305 0 74.719-48.957 74.719-91.403 0-1.39 0-2.777-.075-4.156 5.141-4.547 9.579-10.18 13.102-16.633-4.79 2.602-9.871 4.305-15.078 5.063 5.48-4.02 9.582-10.336 11.539-17.774-5.156 3.743-10.797 6.38-16.68 7.801-8.136-10.586-21.07-13.18-31.547-6.32-10.472 6.86-15.882 21.46-13.199 35.617C41.922 38.539 22.246 26.336 8.915 6.27 1.933 20.94 5.487 39.723 17.022 49.16c-4.148-.172-8.207-1.555-11.832-4.031v.41c0 15.273 8.786 28.438 21.02 31.492a21.596 21.596 0 01-11.863.543c3.437 13.094 13.297 22.07 24.535 22.328-9.305 8.918-20.793 13.75-32.617 13.72-2.094 0-4.188-.15-6.266-.446 12.008 9.433 25.98 14.441 40.254 14.422" fill="#ffffff">
									</path>
								</svg>
							</a>
						</Link>
					</div>
				}
			</div>

		</div>
	);
};

export default BountyClosed;
