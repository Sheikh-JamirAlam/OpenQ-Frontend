import axios from 'axios';
import React, { useContext, useState } from 'react';
import StoreContext from '../../../../store/Store/StoreContext';
import LoadingIcon from '../../../Loading/ButtonLoadingIcon';
import Github from '../../../svg/github';
const RefreshBounty = ({ bounty, refreshGithubBounty }) => {
  const [appState] = useContext(StoreContext);
  const [completed, setCompleted] = useState(true);
  const { id } = bounty;
  const handleRefresh = async () => {
    const url = `${process.env.NEXT_PUBLIC_GITHUB_PROXY_URL}/invalidate_entity?id=${id}`;
    try {
      const axiosConfig = {
        withCredentials: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      };
      setCompleted(false);
      await axios.get(url, axiosConfig);
    } catch (e) {
      appState.logger.error(e);
    }
    await refreshGithubBounty();
    setCompleted(true);
  };
  // get github proxy with id in query params use axios
  return (
    <>
      <button
        onClick={handleRefresh}
        className={` whitespace-nowrap btn-primary flex flex-row space-x-3 items-center justify-center leading-tight sm:w-min px-3 h-8`}
      >
        {completed ? <Github className={'w-6 h-4'} /> : <LoadingIcon />}
        <div>Refresh</div>
      </button>
    </>
  );
};

export default RefreshBounty;
