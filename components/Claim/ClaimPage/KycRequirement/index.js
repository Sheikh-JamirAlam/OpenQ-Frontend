import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useContext, useState } from 'react';
import StoreContext from '../../../../store/Store/StoreContext';
import LoadingIcon from '../../../Loading/ButtonLoadingIcon';
import ShieldCheck from '../../../svg/shieldCheck';

const KycRequirement = () => {
  // to be added: setState to verified & setError('') when know that Kyc'd
  const [stage, setStage] = useState('start');
  const [error, setError] = useState('');
  const [appState] = useContext(StoreContext);
  const onOpenSDK = useCallback(async () => {
    try {
      const { KycDaoClient } = await import('@kycdao/widget');

      new KycDaoClient({
        parent: '#modalroot',
        config: {
          demoMode: false,
          enabledBlockchainNetworks: ['PolygonMainnet'],
          enabledVerificationTypes: ['KYC'],
          evmProvider: window.ethereum,
          baseUrl: 'https://kycdao.xyz',
        },
      }).open();
    } catch (error) {
      setError(error);
      appState.logger.error(error, 'KycRequirement.js1');
    }

    setStage('processing');
  }, []);
  return (
    <section className='flex flex-col gap-3'>
      <h4 className='flex content-center items-center gap-2 border-b border-gray-700 pb-2'>
        <Image src='/kycDao-logo.svg' width={130} height={130} alt='kycDao-logo' />
        <div
          className={`${
            stage == 'verified' ? 'bg-[#1c6f2c] border-[#2ea043]' : 'bg-info  border-info-strong'
          } border-2 text-sm px-2 rounded-full h-6`}
        >
          {stage == 'verified' ? 'Approved' : 'Required'}
        </div>
      </h4>
      {error && (
        <div className='bg-info border-info-strong border-2 p-3 rounded-sm'>
          Something went wrong, please try again or reach out for support at{' '}
          <Link
            href='https://discord.gg/puQVqEvVXn'
            rel='noopener norefferer'
            target='_blank'
            className='underline col-span-2'
          >
            OpenQ
          </Link>{' '}
          or{' '}
          <Link
            href='https://discord.kycdao.xyz/'
            rel='noopener norefferer'
            target='_blank'
            className='underline col-span-2'
          >
            KYC DAO
          </Link>
          .
        </div>
      )}
      <div className='font-semibold'>What is kycDAO?</div>
      <div>
        kycDAO is a multichain platform for issuing reusable, onchain KYC verifications.
        <div>
          Learn more{' '}
          <Link
            href='https://kycdao.xyz/home'
            rel='noopener norefferer'
            target='_blank'
            className='text-blue-500 hover:underline col-span-2'
          >
            here
          </Link>
          .
        </div>
      </div>
      <div className='font-semibold'>Verify now</div>
      <button
        className={`flex items-center gap-2 ${
          stage == 'start' ? 'btn-requirements' : stage == 'processing' ? 'btn-processing' : 'btn-verified'
        } w-fit`}
        onClick={onOpenSDK}
      >
        <ShieldCheck className={'w-4 h-4 fill-primary'} />
        {stage == 'verified' ? 'Verified' : 'Start'}
        {stage == 'processing' && <LoadingIcon />}
      </button>
    </section>
  );
};

export default KycRequirement;
