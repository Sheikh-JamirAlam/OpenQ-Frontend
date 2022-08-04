// Third Party
import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Custom
import ToolTip from '../Utils/ToolTipNew';

const OrganizationMetadata = ({organizationData, repositories})=>{
	useEffect(()=>{
		console.log(JSON.stringify(organizationData));
	});

	const languages = repositories.reduce((languages, repository)=>{
		const newLanguages = repository.languages.filter(currentLanguage=>!languages.some(language=>currentLanguage.name ===language.name));
	
		return [...languages, ...newLanguages];
	},[]);


	return (
		<ul className='w-full max-w-[960px] md:shrink-0 md:basis-1/4'>
			
			{organizationData?.membersWithRole?.nodes?.length >0 && <li className='border-b border-web-gray pt-3 pb-6'>
				<div className='text-normal text-primary pb-3'>People</div>
				<div className='flex gap-2 flex-wrap'>
					{organizationData.membersWithRole.nodes.map((member, index)=>{return <ToolTip key={index} toolTipText={member.name}>
						<Link href={member.url}>
							<Image key={index} className='rounded-lg cursor-pointer' height={36} width={36} src={member.avatarUrl}/>
						</Link>						
					</ToolTip>;
						
					})}</div>
			</li>}	{languages.length >0 && <li className='border-b border-web-gray pb-8'>
					
				<div className='text-normal text-primary py-4 flex'>Top Languages</div>
				<div className='flex flex-wrap gap-2 w-60'>	{languages.map(language=>{
					return <>
						
						<div className='w-fit inline' >	<div style={{backgroundColor: language.color}} className='w-3 h-3 rounded-lg inline-block'></div> <span className='text-sm'>{language.name}</span></div>
							
					</>;})}	</div>
			</li>
			}
			
			
				
			
		</ul>

	);
};

export default OrganizationMetadata;