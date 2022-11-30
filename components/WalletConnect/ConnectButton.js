// Third party
import React, { useState, useEffect, useRef, useContext } from 'react';
import jazzicon from '@metamask/jazzicon';
// Custom
import useWeb3 from '../../hooks/useWeb3';
import useConnectOnLoad from '../../hooks/useConnectOnLoad';
import chainIdDeployEnvMap from './chainIdDeployEnvMap';
import AccountModal from './AccountModal';
import ConnectModal from './ConnectModal';
import useEns from '../../hooks/useENS';
import useIsOnCorrectNetwork from '../../hooks/useIsOnCorrectNetwork';
import StoreContext from '../../store/Store/StoreContext';
import AuthButton from '../Authentication/AuthButton';
import { useRouter } from 'next/router';
import useAuth from '../../hooks/useAuth';
import ToolTipNew from '../Utils/ToolTipNew';
// import axios from 'axios';

const ConnectButton = ({ needsGithub, nav, tooltipAction }) => {
  // Context
  const { chainId, error, account, safe } = useWeb3();
  const [ensName] = useEns(account);
  const [authState] = useAuth();
  const router = useRouter();
  const [appState, dispatch] = useContext(StoreContext);
  const { walletConnectModal } = appState;

  // State
  const [isConnecting, setIsConnecting] = useState(false);
  const [isOnCorrectNetwork] = useIsOnCorrectNetwork({
    chainId: chainId,
    error: error,
    account: account,
  });
  const [showModal, setShowModal] = useState();
  const iconWrapper = useRef();
  const modalRef = useRef();
  const buttonRef = useRef();

  // Hooks
  const connectOnLoad = useConnectOnLoad(); // See [useEagerConnect](../../hooks/useEagerConnect.js)

  if (typeof connectOnLoad === 'function') {
    connectOnLoad();
  }
  useEffect(() => {
    const createJazzicon = async () => {
      if (account && iconWrapper.current) {
        iconWrapper.current.innerHTML = '';
        iconWrapper.current.appendChild(jazzicon(26, parseInt(account.slice(2, 10), 16)));
      }
    };
    createJazzicon();
  }, [account, isOnCorrectNetwork]);

  useEffect(() => {
    let handler = (event) => {
      if (!modalRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) {
        setShowModal(false);
      }
    };
    window.addEventListener('mousedown', handler);

    return () => {
      window.removeEventListener('mousedown', handler);
    };
  });

  // Methods
  const openConnectModal = async () => {
    const payload = {
      type: 'CONNECT_WALLET',
      payload: true,
    };
    dispatch(payload);
  };

  const closeModal = () => {
    const payload = {
      type: 'CONNECT_WALLET',
      payload: false,
    };
    dispatch(payload);
  };

  const addOrSwitchNetwork = () => {
    window.ethereum
      .request({
        method: 'wallet_addEthereumChain',
        params: chainIdDeployEnvMap[process.env.NEXT_PUBLIC_DEPLOY_ENV]['params'],
      })
      .catch((err) => appState.logger.error(err, account));
  };

  // Render
  return (
    <>
      {needsGithub && !authState.isAuthenticated ? (
        <AuthButton redirectUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/` + router.asPath} />
      ) : (
        <div>
          {account && isOnCorrectNetwork ? (
            <>
              {nav ? (
                <div>
                  <button
                    disabled={isConnecting}
                    ref={buttonRef}
                    onClick={() => {
                      setShowModal(!showModal);
                    }}
                    className='group flex items-center gap-x-1 h-12 whitespace-nowrap py-1 px-3 font-semibold cursor-pointer'
                  >
                    <span
                      className='border border-[#8b949e] rounded-full h-7 py-pxt group-hover:border-opacity-70'
                      ref={iconWrapper}
                    ></span>
                    <span className='md:group-hover:opacity-70'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-3 w-3'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='white'
                        strokeWidth='3'
                      >
                        <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
                      </svg>
                    </span>
                  </button>

                  {showModal && (
                    <AccountModal
                      domRef={modalRef}
                      account={account}
                      ensName={ensName}
                      chainId={chainId}
                      setIsConnecting={setIsConnecting}
                      isSafeApp={safe}
                    />
                  )}
                </div>
              ) : null}
            </>
          ) : isOnCorrectNetwork ? (
            <ToolTipNew
              relativePosition={'left-0'}
              outerStyles={'-top-1 '}
              groupStyles={'w-min'}
              innerStyles={'sm:w-40 md:w-60 whitespace-normal'}
              toolTipText={`Connect your wallet to ${tooltipAction}`}
            >
              <button
                onClick={openConnectModal}
                className='flex items-center btn-default mr-4 hover:border-[#8b949e] hover:bg-[#30363d] whitespace-nowrap'
                disabled={isConnecting}
              >
                {'Connect Wallet'}
              </button>
            </ToolTipNew>
          ) : (
            <ToolTipNew
              relativePosition={'left-0'}
              outerStyles={'-top-1 '}
              groupStyles={'w-min'}
              innerStyles={'sm:w-40 md:w-60 whitespace-normal'}
              toolTipText={'Please switch to the correct network to fund this contract.'}
            >
              <button
                onClick={addOrSwitchNetwork}
                className='flex items-center btn-default mr-4 hover:border-[#8b949e] hover:bg-[#30363d] whitespace-nowrap'
              >
                Use {chainIdDeployEnvMap[process.env.NEXT_PUBLIC_DEPLOY_ENV]['networkName']} Network
              </button>
            </ToolTipNew>
          )}
          {walletConnectModal && <ConnectModal closeModal={closeModal} setShowModal={setShowModal} />}
        </div>
      )}
    </>
  );
};

export default ConnectButton;
