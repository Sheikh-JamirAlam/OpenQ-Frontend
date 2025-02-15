/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '../../../test-utils';
import ClaimPage from '.';
import axios from 'axios';
import InitialState from '../../../store/Store/InitialState';
import userEvent from '@testing-library/user-event';
import nextRouter from 'next/router';
import Constants from '../../../test-utils/constant';
nextRouter.useRouter = jest.fn();
const push = jest.fn(() => {
  return { catch: jest.fn };
});

describe('ClaimPage', () => {
  beforeEach(() => {
    nextRouter.useRouter.mockImplementation(() => ({
      query: { type: null },
      prefetch: jest.fn(() => {
        return { catch: jest.fn };
      }),
      push,
    }));
  });
  const bounty = Constants.bounty;
  jest.mock('axios');
  axios.get = jest.fn().mockResolvedValue({ data: { data: 'true' } });

  beforeEach(() => {
    InitialState.openQClient.reset();
  });
  it('should render the headings when ready to claim', async () => {
    // ARRANGE
    const user = userEvent.setup();
    render(<ClaimPage bounty={bounty} price={100} />);

    // ACT
    const claimTitle = await screen.findByText('Claim Your Rewards');
    const claimBtn = screen.getByText('Claim');
    await user.click(claimBtn);

    // ASSERT
    const confirmBtn = await screen.findByText('Yes! Claim!');
    expect(claimTitle).toBeInTheDocument();
    expect(confirmBtn).toBeInTheDocument();

    // should not have null or undefined values
    const nullish = [...screen.queryAllByRole(/null/), ...screen.queryAllByRole(/undefined/)];
    expect(nullish).toHaveLength(0);
  });

  it('should deactivate claim when TVL is zero', async () => {
    // ARRANGE
    const user = userEvent.setup();
    render(<ClaimPage bounty={bounty} price={0} />);

    // ACT
    const claimTitle = await screen.findByText('Claim Your Rewards');
    const claimBtn = screen.getByRole('button', { name: 'Claim' });
    await user.hover(claimBtn);

    // ASSERT
    const tooltip = await screen.findByText(
      'There are no funds locked to claim, contact the maintainer of this issue.'
    );
    expect(claimTitle).toBeInTheDocument();
    expect(tooltip).toBeInTheDocument();

    await user.click(claimBtn);
    expect(claimBtn).toBeDisabled();

    // should not have null or undefined values
    const nullish = [...screen.queryAllByRole(/null/), ...screen.queryAllByRole(/undefined/)];
    expect(nullish).toHaveLength(0);
  });
});
