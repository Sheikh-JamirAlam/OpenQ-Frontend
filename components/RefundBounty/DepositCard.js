// Third Party
import React, { useContext } from 'react';
import StoreContext from '../../store/Store/StoreContext';
import useGetTokenValues from '../../hooks/useGetTokenValues';
import TokenBalances from '../TokenBalances/TokenBalances';
const DepositCard = ({ deposit, refundBounty, status }) => {
	// Context
	const [appState] = useContext(StoreContext);

	// State
	const [tokenValues] = useGetTokenValues(deposit);
	console.log(deposit);

	return (
		<div className={`flex flex-col items-start px-8 sm:px-6 pb-4 max-w-sm bg-web-gray/20 ${status === 'refundable' ? ' border-pink-300' : status === 'not-yet-refundable' ? '' : ' border-web-gray'} border rounded-md`}>
			<TokenBalances
				tokenBalances={deposit}
				tokenValues={tokenValues}
				singleCurrency={true}
			/>
			<div className="text-left text-white pb-4">
				Deposited on: {appState.utils.formatUnixDate(parseInt(deposit.receiveTime))}
			</div>
			{deposit.refunded ?
				(<div className="text-left text-white pb-2">
					Refunded on: {appState.utils.formatUnixDate(parseInt(deposit.refundTime))}
				</div>)
				:
				(<div className="text-left text-white pb-2">
					Refundable on: {appState.utils.formatUnixDate(parseInt(deposit.receiveTime) + parseInt(deposit.expiration))}
				</div>)
			}
<<<<<<< HEAD
			{status==='refundable' && refundBounty &&
			<button  className='items-left w-1/2 text-lg text-white self-center sm-confirm-btn'  onClick={() => refundBounty(deposit.id)}>
=======
			{status === 'refundable' &&
				<button className='items-left w-1/2 text-lg text-white self-center sm-confirm-btn' onClick={() => refundBounty(deposit.id)}>
>>>>>>> f7dcd838b098975a6df9eea936e1ee59c6630cce
					Refund
				</button>}
		</div>

	);
};

export default DepositCard;
