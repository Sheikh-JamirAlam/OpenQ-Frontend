// Third party
import React, { useRef, useEffect, useContext } from 'react';
import Link from 'next/link';

// Custom
import { CONFIRM, APPROVING, TRANSFERRING, SUCCESS, ERROR } from './ApproveFundState';
import LoadingIcon from '../Loading/ButtonLoadingIcon';
import Image from 'next/image';
import CopyAddressToClipboard from '../Copy/CopyAddressToClipboard';
import StoreContext from '../../store/Store/StoreContext';
import useWeb3 from '../../hooks/useWeb3';
import LinkText from '../svg/linktext';
import Cross from '../svg/cross';
import Twitter from '../svg/twitter';

const ApproveFundModal = ({
  transactionHash,
  setShowApproveTransferModal,
  approveTransferState,
  resetState,
  error,
  confirmationMessage,
  confirmMethod,
  approvingMessage,
  approvingTitle,
  token,
  volume,
  bountyAddress,
  bounty,
  allowance,
  /*openInvoicingModal*/
}) => {
  const modal = useRef();
  const updateModal = () => {
    resetState();
    setShowApproveTransferModal(false);
  };
  const [appState] = useContext(StoreContext);
  const { account } = useWeb3();
  useEffect(async () => {
    try {
      /*
      const invoicingData = await appState.openQPrismaClient.getInvoicingData(account);
      setInvoicingData(invoicingData);
      */
    } catch (err) {
      appState.logger.error(err, account, bounty.id);
    }
  }, []);
  useEffect(() => {
    // Courtesy of https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
    function handleClickOutside(event) {
      if (modal.current && !modal.current.contains(event.target)) {
        updateModal();
      }
    }

    // Bind the event listener
    if (approveTransferState !== APPROVING && approveTransferState !== TRANSFERRING) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modal, approveTransferState]);

  let title = {
    [CONFIRM]: 'Confirm Deposit',
    [APPROVING]: approvingTitle || 'Approve',
    [TRANSFERRING]: 'Transfer',
    [SUCCESS]: 'Transfer Complete!',
    [ERROR]: `${error.title}`,
  };
  let approveStyles = {
    [CONFIRM]: 'btn-primary',
    [APPROVING]: 'btn-primary',
    [TRANSFERRING]: 'btn-default',
  };

  let fundStyles = {
    [CONFIRM]: 'px-8 border-transparent',
    [APPROVING]: 'px-8 border-transparent',
    [TRANSFERRING]: 'btn-primary',
  };
  if ('0x0000000000000000000000000000000000000000' === token.address) {
    fundStyles = { ...approveStyles };
  }

  let message = {
    [CONFIRM]: `${confirmationMessage}`,
    [APPROVING]: approvingMessage || 'Approving...',
    [TRANSFERRING]: 'Transferring...',
    [SUCCESS]: `Transaction confirmed! Check out your transaction with the link below:\n
		`,
    [ERROR]: `${error.message}`,
  };

  let link = {
    [SUCCESS]: `${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_BASE_URL}/tx/${transactionHash}`,
    [ERROR]: error.link,
  };

  let linkText = {
    [ERROR]: `${error.linkText}`,
  };

  const tweetText = `💸 Just funded this issue from ${bounty.owner}/${bounty.repoName} on OpenQ, looking for devs to work on it: `;

  volume = Math.round(volume * Math.pow(10, 10)) / Math.pow(10, 10);

  return (
    <div>
      <div className='justify-center items-center flex overflow-x-hidden text-primary overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none'>
        <div ref={modal} className='min-w-[320px] max-w-[620px] mx-8 px-4'>
          <div className='relative rounded-sm p-6 shadow-lg flex flex-col w-full bg-[#161B22] outline-none focus:outline-none'>
            <button data-testid='cross' className='absolute top-4 right-4 cursor-pointer' onClick={() => updateModal()}>
              <Cross />
            </button>
            <div className='flex items-center justify-center border-solid'>
              <div className='flex flex-row'>
                <div className='text-2xl font-semibold'>{title[approveTransferState]}</div>
              </div>
            </div>
            {approveTransferState === 'ERROR' ? (
              <div className='text-md pb-4'>
                <p className='break-words'>{message[approveTransferState]}</p>
                {link[approveTransferState] && (
                  <p className='break-all underline'>
                    <Link href={link[approveTransferState]}>
                      <a target={'_blank'} rel='noopener noreferrer'>
                        {linkText[approveTransferState] || link[approveTransferState]}
                        <LinkText />
                      </a>
                    </Link>
                  </p>
                )}
              </div>
            ) : approveTransferState === SUCCESS ? (
              <>
                <div className='text-md gap-4 py-6 px-4 grid grid-cols-[1fr_1fr] w-full justify-between'>
                  <div className='w-4'>Deposited</div>
                  <div className='flex flex-wrap justify-between w-[120px] gap-2'>
                    <Image
                      width={24}
                      className='inline'
                      height={24}
                      src={token.path || token.logoURI || '/crypto-logs/ERC20.svg'}
                    />
                    <span>
                      {volume} {token.symbol}
                    </span>
                  </div>
                  <span>To</span>
                  <CopyAddressToClipboard data={bountyAddress} clipping={[5, 39]} />
                  <span>For</span>
                  {bounty.url && (
                    <Link href={bounty.url}>
                      <a target='_blank' rel='noopener noreferrer' className='underline'>
                        {bounty.title}
                      </a>
                    </Link>
                  )}
                  <span>Transaction</span>
                  <Link href={link[approveTransferState]}>
                    <a target={'_blank'} className='underline' rel='noopener noreferrer'>
                      {transactionHash.slice(0, 5)} . . . {transactionHash.slice(62)}
                      <LinkText />
                    </a>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className='text-md gap-4 py-6 pb-4 px-4 grid grid-cols-[1fr_1fr] w-full justify-between'>
                  <div className='w-4'>Funding</div>
                  <div className='flex flex-wrap justify-between w-[120px] gap-2'>
                    <Image
                      width={24}
                      className='inline'
                      height={24}
                      src={token.path || token.logoURI || '/crypto-logos/ERC20.svg'}
                    />
                    <span>
                      {volume} {token.symbol}
                    </span>
                  </div>
                  <span>To</span>
                  <CopyAddressToClipboard data={bountyAddress} clipping={[5, 39]} />
                  <span>For</span>
                  {bounty.url && (
                    <Link href={bounty.url}>
                      <a target='_blank' rel='noopener noreferrer' className='underline'>
                        {bounty.title}
                      </a>
                    </Link>
                  )}
                  <div
                    className='py-4 col-span-2 text-center'
                    dangerouslySetInnerHTML={{ __html: message[approveTransferState] }}
                  />
                </div>
                {token.address !== '0x0000000000000000000000000000000000000000' && !allowance ? (
                  <div className='flex px-1.5 gap-2 border-gray-700 border rounded-sm py-1.5 self-center'>
                    <button
                      onClick={confirmMethod}
                      disabled={approveTransferState !== CONFIRM}
                      className={`flex btn-primary p-2 gap-2 ${
                        approveTransferState === CONFIRM ? 'cursor-pointer' : null
                      } ${approveStyles[approveTransferState]}`}
                    >
                      <span>
                        {approveTransferState === CONFIRM
                          ? 'Approve'
                          : approveTransferState === APPROVING
                          ? 'Approving'
                          : 'Approved'}
                      </span>
                      {approveTransferState === APPROVING && <LoadingIcon className={'inline pt-1'} />}
                    </button>

                    <div
                      className={`text-center px-2 flex gap-2 py-1.5 border ${
                        approveTransferState === TRANSFERRING ? 'cursor-pointer' : null
                      } ${fundStyles[approveTransferState]}`}
                    >
                      <span>{approveTransferState === TRANSFERRING ? 'Funding' : 'Fund'}</span>
                      {approveTransferState === TRANSFERRING && <LoadingIcon className={'inline pt-1'} />}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={confirmMethod}
                    disabled={approveTransferState !== CONFIRM}
                    className={`py-1.5 flex justify-center gap-4 ${approveStyles[approveTransferState]}`}
                  >
                    <span>{approveTransferState === TRANSFERRING ? 'Funding' : 'Fund'}</span>
                    {approveTransferState === TRANSFERRING && <LoadingIcon className={'inline pt-1'} />}
                  </button>
                )}
              </>
            )}
            {approveTransferState == ERROR ? (
              <div className='flex items-center justify-center text-lg rounded-b'>
                <button
                  onClick={() => updateModal()}
                  className='btn-default py-1.5 text-center flex justify-center cursor-pointer w-full'
                >
                  <span>Close</span>
                </button>
              </div>
            ) : (
              approveTransferState == SUCCESS && (
                <Link
                  href={`https://twitter.com/intent/tweet/?text=${tweetText}${process.env.NEXT_PUBLIC_BASE_URL}/contract/${bounty.bountyId}/${bounty.bountyAddress}`}
                >
                  <a
                    className='hover:scale-105 animate-single-bounce duration-100'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <div className='flex justify-center items-center m-5 btn-primary'>
                      <div className='flex justify-center items-center gap-2'>
                        <div className=''>Tweet about it</div>

                        <Twitter className='w-4 inline' />
                      </div>
                    </div>
                  </a>
                </Link>
              )
            )}
            {/*<button onClick={openInvoicingModal} className='btn-primary py-1.5 text-center flex justify-center cursor-pointer w-full'>
								<span>{invoicingData && 'Add'} Invoicing Details</span>
								{approveTransferState === TRANSFERRING && <LoadingIcon className={'inline pt-1'} />}
							</button>*/}
          </div>
        </div>
      </div>
      <div className='bg-overlay z-10 fixed inset-0'></div>
    </div>
  );
};

export default ApproveFundModal;
