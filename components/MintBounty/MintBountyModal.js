// Third party
import React, { useEffect, useState, useContext, useRef } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Image from 'next/image';
import { PersonAddIcon, PersonIcon, PeopleIcon } from '@primer/octicons-react';

// Custom
import useWeb3 from '../../hooks/useWeb3';
import StoreContext from '../../store/Store/StoreContext';

import ToolTipNew from '../Utils/ToolTipNew';
import MintBountyModalButton from './MintBountyModalButton';
import ErrorModal from './ErrorModal';
import useIsOnCorrectNetwork from '../../hooks/useIsOnCorrectNetwork';
import SetTierValues from './SetTierValues';
import TokenFundBox from '../FundBounty/SearchTokens/TokenFundBox';
import SubMenu from '../Utils/SubMenu';
import TokenSearch from '../FundBounty/SearchTokens/TokenSearch';
import ModalLarge from '../Utils/ModalLarge';
import ConnectButton from '../WalletConnect/ConnectButton';
import MintBountyInputIssue from './MintBountyInputIssue';

const MintBountyModal = ({ modalVisibility, types }) => {
  // Context
  const [appState, dispatch] = useContext(StoreContext);
  const { library, account, safe } = useWeb3();
  const zeroAddressMetadata = {
    name: 'Matic',
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'MATIC',
    decimals: 18,
    chainId: 80001,
    path: 'https://wallet-asset.matic.network/img/tokens/matic.svg',
  };
  // State
  const [isOnCorrectNetwork] = useIsOnCorrectNetwork();
  const [hideModal, setHideModal] = useState();
  const [issue, setIssue] = useState();
  const [url, setUrl] = useState('');
  const [bountyAddress, setBountyAddress] = useState();
  const [isLoading, setIsLoading] = useState();
  const [error, setError] = useState();
  const [closed, setClosed] = useState();
  const [enableMint, setEnableMint] = useState();
  const isValidUrl = appState.utils.issurUrlRegex(url);
  const [invoice, setInvoice] = useState(false);
  const [tier, setTier] = useState(3);
  const [tierArr, setTierArr] = useState(['0', '1', '2']);
  const [tierVolumes, setTierVolumes] = useState({ 0: 1, 1: 1, 2: 1 });
  const [currentSum, setCurrentSum] = useState(0);

  const [finalTierVolumes, setFinalTierVolumes] = useState([1, 1, 1]);
  const [payoutVolume, setPayoutVolume] = useState('');
  const [payoutToken, setPayoutToken] = useState(zeroAddressMetadata);
  const [enableRegistration, setEnableRegistration] = useState(false);
  const [startDate, setStartDate] = useState();
  const [registrationDeadline, setRegistrationDeadline] = useState();
  const router = useRouter();
  const initialCategory =
    types[0] === '1'
      ? 'Split Price'
      : types[0] === '2'
      ? 'Contest'
      : types[0] === '3'
      ? 'Fixed Contest'
      : 'Fixed Price';
  const [category, setCategory] = useState(initialCategory);
  // const [template, setTemplate] = useState('');
  const [goalVolume, setGoalVolume] = useState('');
  const [goalToken, setGoalToken] = useState(zeroAddressMetadata);
  const [sum, setSum] = useState(0);
  const [enableContest, setEnableContest] = useState(false);
  const [budgetInput, setBudgetInput] = useState(false);
  const tierConditions = sum == 100;

  // logic if smart contract adjusted: const tierConditions = tier == 0 || (tier > 0 && sum == 100) || tier == '' || tier == undefined
  // and tooltip text: 'Please make sure the number of tiers is set to 0 OR the sum of percentages adds up to 100.'

  // Refs
  const modal = useRef();

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const setReload = () => {
    const payload = {
      type: 'UPDATE_RELOAD',
      payload: true,
    };
    dispatch(payload);
  };

  const refreshBounty = async (address) => {
    await sleep(1000);
    const payload = { type: 'BOUNTY_MINTED', payload: address };
    dispatch(payload);
    let newBounty = await appState.openQSubgraphClient.getBounty(address, 'no-cache');
    try {
      while (!newBounty) {
        newBounty = await appState.openQSubgraphClient.getBounty(address, 'no-cache');
        await sleep(500);
      }
      await sleep(180000); // forcing 3 min waiting time since the new bounty still not visible in list
      const payload = { type: 'BOUNTY_MINTED', payload: '' };
      dispatch(payload);
      setReload();
    } catch (error) {
      setError(true);
    }
  };

  const setIssueUrl = async (issueUrl) => {
    if (!isLoading) {
      setEnableMint();
      let didCancel = false;
      setUrl(issueUrl);
      let issueUrlIsValid = appState.utils.issurUrlRegex(issueUrl);
      if (issueUrlIsValid && !didCancel) {
        async function fetchIssue() {
          try {
            const data = await appState.githubRepository.fetchIssueByUrl(issueUrl);
            if (!didCancel) {
              setIssue(data);
            }
            return data;
          } catch (error) {
            if (!didCancel) {
              setIssue(false);
            }
          }
        }
        const issueData = await fetchIssue();

        if (issueData) {
          try {
            let bounty = await appState.openQSubgraphClient.getBountyByGithubId(issueData.id);
            if (closed === false && bounty?.status == '1' && didCancel) {
              setClosed(true);
            }
            if (!didCancel && closed === true && bounty?.status !== '1') {
              setClosed(false);
            }
            if (bounty && !didCancel) {
              setBountyAddress(bounty.bountyAddress);
            } else {
              if (!didCancel) {
                setEnableMint(true);
                setBountyAddress();
              }
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
      return () => {
        didCancel = true;
      };
    }
  };
  const mintBounty = async () => {
    try {
      setIsLoading(true);
      let data = {
        fundingTokenVolume: goalVolume,
        fundingTokenAddress: goalToken,
      };
      switch (category) {
        case 'Fixed Price':
          break;
        case 'Split Price':
          data = {
            ...data,
            payoutVolume: payoutVolume,
            payoutToken: payoutToken,
          };
          break;
        case 'Contest':
          data = {
            ...data,
            tiers: finalTierVolumes,
          };
          break;
        case 'Fixed Contest':
          data = {
            ...data,
            payoutToken: payoutToken,
            tiers: finalTierVolumes,
          };
          break;
        default:
          throw new Error(`No type: ${category}`);
      }
      const { bountyAddress } = await appState.openQClient.mintBounty(
        library,
        issue.id,
        issue.repository.owner.id,
        category,
        data
      );
      if (enableRegistration) {
        await appState.openQPrismaClient.setIsContest({
          repositoryId: issue.repository.id,
          isContest: true,
          organizationId: issue.repository.owner.id,
          startDate,
          registrationDeadline,
        });
        //repositoryId, isContest, organizationId, startDate, registrationDeadline
      }
      sessionStorage.setItem('justMinted', true);
      refreshBounty(bountyAddress);
      await router.push(`${process.env.NEXT_PUBLIC_BASE_URL}/contract/${issue.id}/${bountyAddress.toLowerCase()}`);
      if (modalVisibility && safe) {
        modalVisibility(false);
      }
    } catch (error) {
      const { message, title } = appState.openQClient.handleError(error);
      appState.logger.error(message, account);
      setError({ message, title });
    }
  };

  const closeModal = () => {
    setIssue();
    setUrl();
    setBountyAddress();
    setIsLoading();
    setError();
    modalVisibility(false);
  };

  useEffect(() => {
    // Courtesy of https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
    function handleClickOutside(event) {
      if (
        modal.current &&
        !modal.current.contains(event.target) &&
        !appState.walletConnectModal &&
        !document.getElementById('connect-modal')?.contains(event.target)
      ) {
        modalVisibility(false);
      }
    }

    // Bind the event listener
    if (!isLoading) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modal, isLoading]);

  // Methods

  function onTierChange(e) {
    if (parseInt(e.target.value) >= 0) {
      setTier(parseInt(e.target.value));
    }
    if (parseInt(e.target.value) > 100) {
      setTier('0');
    }
    if (e.target.value === '') {
      return;
    }
    const newTierArr = Array.from({ length: e.target.value }, (_, i) => i);
    setTierArr(newTierArr);
    const newTierVolumes = {};
    newTierArr.forEach((tier) => {
      newTierVolumes[tier] = tierVolumes[tier] || 1;
    });

    setTierVolumes(newTierVolumes);
  }
  const handleGoalChange = (goalVolume) => {
    appState.utils.updateVolume(goalVolume, setGoalVolume);
  };

  function onGoalCurrencySelect(token) {
    setGoalToken({ ...token, address: ethers.utils.getAddress(token.address) });
  }

  function onCurrencySelect(payoutToken) {
    setPayoutToken({
      ...payoutToken,
      address: ethers.utils.getAddress(payoutToken.address),
    });
  }

  function onVolumeChange(payoutVolume) {
    appState.utils.updateVolume(payoutVolume, setPayoutVolume);
  }

  useEffect(() => {
    if (finalTierVolumes.length) {
      setSum(finalTierVolumes.reduce((a, b) => a + b));
    }
    if (finalTierVolumes.length) {
      setCurrentSum(
        finalTierVolumes.reduce((a, b) => {
          if (a && b) {
            return a + b;
          }
          if (a) {
            return a;
          }
          if (b) {
            return b;
          }
          return 0;
        })
      );
    }
    if (sum == 100) {
      setEnableContest(true);
    }
  }, [finalTierVolumes]);

  useEffect(() => {
    if (category == 'Contest' && !tierConditions) {
      setEnableContest(false);
    } else {
      setEnableContest(true);
    }
  }, [category, tier, sum]);

  const footerLeft = (
    <a
      href={'https://github.com/OpenQDev/OpenQ-Contracts/blob/production/contracts/Bounty/Implementations/BountyV1.sol'}
      className='flex gap-2 underline'
      target='_blank'
      rel='noreferrer'
    >
      <>
        <Image src={'/social-icons/github-logo-white.svg'} width={24} height={24} alt='github-logo' />
        Contract source code
      </>
    </a>
  );

  const btn = !error && (
    <>
      <ConnectButton nav={false} needsGithub={false} tooltipAction={'mint a contract.'} />
      {account && isOnCorrectNetwork && (
        <ToolTipNew
          outerStyles={'hover:hidden -top-20 md:top-auto'}
          triangleStyles={'mt-7 md:mt-1 rotate-180 md:rotate-0 '}
          hideToolTip={(enableContest && enableMint && !issue?.closed && issue?.url.includes('/issues/')) || isLoading}
          toolTipText={
            issue?.closed && issue?.url.includes('/issues/')
              ? 'Issue closed'
              : !enableMint || !issue?.url.includes('/issues/')
              ? 'Please choose an elgible issue.'
              : currentSum !== sum
              ? 'Please make sure each tier gets a percentage.'
              : !enableContest
              ? 'Please make sure the sum of tier percentages adds up to 100.'
              : null
          }
        >
          <MintBountyModalButton
            mintBounty={mintBounty}
            enableMint={enableContest && enableMint && !issue?.closed && issue?.url.includes('/issues/') && !isLoading}
            transactionPending={isLoading}
          />
        </ToolTipNew>
      )}
    </>
  );

  // Render
  return (
    <>
      {error ? (
        <ErrorModal setShowErrorModal={closeModal} error={error} />
      ) : (
        <ModalLarge
          title={`Deploy ${category} Contract`}
          footerLeft={footerLeft}
          footerRight={btn}
          setShowModal={modalVisibility}
          resetState={closeModal}
        >
          <div className='h-full grid grid-cols-[150px_1fr] gap-4'>
            <div className='pl-4 p-2 text-muted border-r border-gray-700'>
              <div className='pb-2'>Contract Type</div>
              <SubMenu
                items={[
                  { name: 'Fixed Price', Svg: PersonIcon },
                  { name: 'Split Price', Svg: PersonAddIcon },
                  { name: 'Contest', Svg: PeopleIcon },
                  { name: 'Fixed Contest', Svg: PeopleIcon },
                ]}
                internalMenu={category}
                updatePage={setCategory}
                styles={'justify-center'}
                vertical={true}
              />
            </div>
            <div className='overflow-y-auto px-2'>
              <h3 className='text-xl pt-2'>
                {category === 'Split Price'
                  ? 'Pay out a fixed amount to any contributors who submit work to this bounty, as many times as you like'
                  : `Create a${
                      category === 'Fixed price' ? 'n' : ''
                    } ${category} Contract to send funds to any GitHub issue`}
              </h3>
              <MintBountyInputIssue
                setIssueUrl={setIssueUrl}
                issueData={issue}
                url={url}
                isValidUrl={isValidUrl}
                bountyAddress={bountyAddress}
              />
              <div className='flex flex-col  gap-2 py-2 w-full items-start  text-base bg-[#161B22]'>
                <div className='flex items-center gap-2 font-semibold'>
                  Is this Contract invoiceable?
                  <ToolTipNew mobileX={10} toolTipText={'Do you want an invoice for this contract?'}>
                    <div className='cursor-help rounded-full border border-[#c9d1d9] text-sm aspect-square leading-4 h-4 box-content text-center font-bold text-primary'>
                      ?
                    </div>
                  </ToolTipNew>
                </div>
                <div className='flex-1 w-full'>
                  <div className='flex text-sm rounded-sm text-primary '>
                    <ToolTipNew innerStyles={'flex'} toolTipText={'Invoicing feature coming soon'}>
                      <button
                        disabled={true}
                        onClick={() => setInvoice(true)}
                        className={`cursor-not-allowed w-fit min-w-[80px] py-[5px] px-4 rounded-l-sm border whitespace-nowrap ${
                          invoice ? 'bg-secondary-button border-secondary-button' : ''
                        }  border-web-gray`}
                      >
                        Yes
                      </button>
                    </ToolTipNew>
                    <button
                      onClick={() => setInvoice(false)}
                      className={`w-fit min-w-[80px] py-[5px] px-4 border-l-0 rounded-r-sm border whitespace-nowrap ${
                        !invoice
                          ? 'bg-secondary-button border-secondary-button'
                          : 'hover:bg-secondary-button hover:border-secondary-button border-web-gray'
                      } `}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>

              {category !== 'Fixed Contest' && (
                <div className=' flex flex-col gap-2 w-full py-2 items-start text-base bg-[#161B22]'>
                  <div className='flex items-center gap-2 font-semibold'>
                    Set a Budget
                    <input type='checkbox' className='checkbox' onChange={() => setBudgetInput(!budgetInput)}></input>
                    <ToolTipNew
                      mobileX={10}
                      toolTipText={
                        category === 'Fixed Price'
                          ? 'Amount of funds you would like to escrow on this issue.'
                          : 'How much will each successful submitter earn?'
                      }
                    >
                      <div className='cursor-help rounded-full border border-[#c9d1d9] aspect-square leading-4 h-4 box-content text-center font-bold text-primary'>
                        ?
                      </div>
                    </ToolTipNew>
                  </div>
                  <span className='text-sm '>
                    You don{"'"}t have to deposit now! The budget is just what you intend to pay.
                  </span>
                  {budgetInput ? (
                    <div className='flex-1 w-full px-2'>
                      <TokenFundBox
                        label='budget'
                        onCurrencySelect={onGoalCurrencySelect}
                        onVolumeChange={handleGoalChange}
                        volume={goalVolume}
                        token={goalToken}
                        styles={'flex-col sm:flex-row space-y-4 space-x-0 sm:space-x-4 sm:space-y-0'}
                      />
                    </div>
                  ) : null}
                </div>
              )}
              {category === 'Split Price' ? (
                <>
                  <div className='flex flex-col gap-2 w-full items-start py-2 pb-4 text-base bg-[#161B22]'>
                    <div className='flex items-center gap-2 font-semibold'>
                      Reward Split?
                      <ToolTipNew mobileX={10} toolTipText={'How much will each successful submitter earn?'}>
                        <div className='cursor-help rounded-full border border-[#c9d1d9] aspect-square text-sm leading-4 h-4 box-content text-center font-bold text-primary'>
                          ?
                        </div>
                      </ToolTipNew>
                    </div>
                    <div className='flex-1 w-full'>
                      <TokenFundBox
                        label='split'
                        onCurrencySelect={onCurrencySelect}
                        onVolumeChange={onVolumeChange}
                        token={payoutToken}
                        volume={payoutVolume}
                        styles={'flex-col sm:flex-row space-y-4 space-x-0 sm:space-x-4 sm:space-y-0'}
                      />
                    </div>
                  </div>
                </>
              ) : category === 'Contest' || category === 'Fixed Contest' ? (
                <div className='items-center py-2'>
                  <div className=' w-11/12 text-base flex flex-col gap-2'>
                    <div className=' flex flex-col gap-2 w-full py-2 items-start text-base bg-[#161B22]'>
                      <div className='flex items-center gap-2 font-semibold'>
                        Enable Hackathon Registration
                        <input
                          type='checkbox'
                          className='checkbox'
                          onChange={() => setEnableRegistration(true)}
                        ></input>
                        <ToolTipNew
                          mobileX={10}
                          toolTipText={
                            category === 'Fixed Price'
                              ? 'Amount of funds you would like to escrow on this issue.'
                              : 'How much will each successful submitter earn?'
                          }
                        >
                          <div className='cursor-help rounded-full border border-[#c9d1d9] aspect-square leading-4 h-4 box-content text-center font-bold text-primary'>
                            ?
                          </div>
                        </ToolTipNew>
                      </div>
                      <span className='text-sm '>
                        Require contestants to sign up for your hackathon contests in this repo. This will allow you to
                        set a timeline, be highlighted on OpenQ, and ensure you can connect with all participants
                        post-hackathon.
                      </span>
                    </div>
                    {enableRegistration ? (
                      <>
                        <div className='flex items-center gap-2'>Start Date</div>

                        <input
                          className={'flex-1 input-field w-full ml-2'}
                          id='name'
                          aria-label='issue url'
                          placeholder='https://github.com/...'
                          autoComplete='off'
                          type='date'
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                        <div className='flex items-center gap-2'>End Date</div>

                        <input
                          className={'flex-1 input-field w-full ml-2'}
                          id='name'
                          aria-label='issue url'
                          placeholder='https://github.com/...'
                          autoComplete='off'
                          type='date'
                          value={registrationDeadline}
                          onChange={(e) => setRegistrationDeadline(e.target.value)}
                        />
                      </>
                    ) : null}

                    <div className='flex items-center gap-2 font-semibold'>
                      How many Tiers?
                      <ToolTipNew
                        mobileX={10}
                        toolTipText={"How many people will be able to claim a prize? Don't exceed 100."}
                      >
                        <div className='cursor-help rounded-full border border-[#c9d1d9] text-sm aspect-square leading-4 h-4 box-content text-center font-bold text-primary'>
                          ?
                        </div>
                      </ToolTipNew>
                    </div>
                    <input
                      className={'flex-1 input-field w-full'}
                      id='name'
                      aria-label='tiers'
                      placeholder='0'
                      autoComplete='off'
                      defaultValue={3}
                      type='text'
                      min='0'
                      max='100'
                      onChange={(e) => onTierChange(e)}
                    />
                  </div>
                  {category === 'Fixed Contest' && (
                    <div className='flex flex-col w-11/12 items-start py-2 gap-2 text-base pb-4'>
                      <div className='flex items-center gap-2'>
                        <div className='flex items-center gap-2 font-semibold '>
                          Which token?
                          <ToolTipNew mobileX={10} toolTipText={'Fixed contests can only be funded with one token.'}>
                            <div className='cursor-help rounded-full border border-[#c9d1d9] aspect-square text-sm leading-4 h-4 box-content text-center font-bold text-primary'>
                              ?
                            </div>
                          </ToolTipNew>
                        </div>
                      </div>
                      <div className=''>
                        <TokenSearch
                          token={payoutToken}
                          setShowTokenSearch={setHideModal}
                          showTokenSearch={hideModal}
                          onCurrencySelect={onCurrencySelect}
                          alone={true}
                        />
                      </div>
                    </div>
                  )}
                  {tier > 0 ? (
                    <SetTierValues
                      category={category}
                      sum={sum}
                      currentSum={currentSum}
                      finalTierVolumes={finalTierVolumes}
                      setFinalTierVolumes={setFinalTierVolumes}
                      setSum={setSum}
                      tierArr={tierArr}
                      setEnableContest={setEnableContest}
                      initialVolumes={['1', '1', '1']}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </ModalLarge>
      )}
    </>
  );
};

export default MintBountyModal;
