// Third Party
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Skeleton from 'react-loading-skeleton';

const OrganizationCard = ({ organization  }) => {

	// Context
	let orgName = organization?.name.charAt(0).toUpperCase() + organization?.name.slice(1);

	if (orgName?.length > 10) {
		orgName = orgName.slice(0, 9).concat('...');
	}

	// Methods

	// Render
	return (
		<div className={!organization ? 'pointer-events-none cursor-normal' : undefined}>
			<Link href={(organization)? `/organization/${organization.login}`:'/'}>
				<div
					className={
						'flex flex-col p-6 items-center font-mont rounded-xl shadow-sm border border-web-gray cursor-pointer pr-11 pl-11'
					}
				>
					<div className="w-16 h-16 relative">
						{organization?
							<Image src={organization?.avatarUrl} alt="n/a" layout="fill" />:
							<Skeleton  baseColor="#333" borderRadius={'1rem'} height={'64px'} width="64px" />}
				
					</div>
					<div className="pt-5 text-center font-semibold text-white">
						{orgName||<Skeleton  width={'50px'} height={'16px'}  baseColor={'#333'}/>}
					</div>
					<div className="bg-pink text-white rounded shadow-md text-gray-300 font-sans relative">

						
						{organization &&`${
							organization?.bountiesCreated.map(
								(bounty) => bounty.status == 'OPEN'
							).length 
						}`}
						{
							organization?`${
								organization.bountiesCreated.map(
									(bounty) => bounty.status == 'OPEN'
								).length < 2
									? ' Bounty'
									: ' Bounties'
							}`:
								<Skeleton width={'64px'} height={'16px'}  baseColor={'#333'}/>}
					</div>
				</div>
			</Link>
		</div>
	);
};

export default OrganizationCard;
