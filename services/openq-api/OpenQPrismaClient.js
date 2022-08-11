import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { WATCH_BOUNTY, UNWATCH_BOUNTY, GET_BOUNTY_BY_HASH, GET_USER_BY_HASH, GET_BOUNTY_PAGE, GET_PR_BY_ID, CREATE_PR, ADD_CONTRIBUTOR, REMOVE_CONTRIBUTOR, GET_IS_BLACKLISTED, GET_ORG, GET_ORGS, STAR_ORG, UN_STAR_ORG } from './graphql/query';
import fetch from 'cross-fetch';
import { ethers } from 'ethers';

class OpenQPrismaClient {
	constructor() { }
	uri = process.env.OPENQ_API_SSR_URL ? process.env.OPENQ_API_SSR_URL : process.env.NEXT_PUBLIC_OPENQ_API_URL;
	httpLink = new HttpLink({ uri: this.uri, fetch,
		credentials: 'include' });

	client = new ApolloClient({
		uri: this.uri + '/graphql',
		link: this.httpLink,
		cache: new InMemoryCache(),
	});

	async watchBounty(contractAddress, userAddress) {
		const promise = new Promise(async (resolve, reject) => {
			try {
				const result = await this.client.mutate({
					mutation: WATCH_BOUNTY,
					variables: { contractAddress, userAddress }
				});
				resolve(result.data.organization);
			} catch (e) {
				reject(e);
			}
		});
		return promise;
	}

	async unWatchBounty(contractAddress, userAddress) {
		const promise = new Promise(async (resolve, reject) => {
			try {
				const result = await this.client.mutate({
					mutation: UNWATCH_BOUNTY,
					variables: { contractAddress, userAddress }
				});
				resolve(result.data.organization);
			} catch (e) {
				reject(e);
			}
		});
		return promise;
	}

	async unStarOrg(id, address) {
		const promise = new Promise(async (resolve, reject) => {
			try {
				const result = await this.client.mutate({
					mutation: UN_STAR_ORG,
					variables: { id, address }
				});
				resolve(result.data);
			} catch (e) {
				reject(e);
			}
		});
		return promise;
	}

	async starOrg(id, address) {
		const promise = new Promise(async (resolve, reject) => {
			try {
				const result = await this.client.mutate({
					mutation: STAR_ORG,
					variables: { id, address }
				});
				resolve(result.data);
			} catch (e) {
				reject(e);
			}
		});
		return promise;
	}

	async getBounty(contractAddress) {
		const promise = new Promise(async (resolve, reject) => {
			try {
				const result = await this.client.query({
					query: GET_BOUNTY_BY_HASH,
					variables: { contractAddress: ethers.utils.getAddress(contractAddress) }
				});
				resolve(result.data.bounty);
			}
			catch (e) {
				reject(e);
			}
		}
		);
		return promise;
	}

	async getPr(prId) {
		const promise = new Promise(async (resolve, reject) => {
			try {
				const result = await this.client.query({
					query: GET_PR_BY_ID,
					variables: { prId },					
					fetchPolicy: 'no-cache'
				});
				resolve(result.data);
			}
			catch (e) {
				reject(e);
			}
		}
		);
		return promise;
	
	}
	createPr(prId, bountyAddress, thumbnail){
		const promise = new Promise(async (resolve, reject) => {
			try {
				const result = await this.client.mutate({
					mutation: CREATE_PR,
					variables: { prId, bountyAddress, thumbnail }
				});
				resolve(result.data);
			}
			catch (e) {
				reject(e);
			}
		}
		);
		return promise;	
	}

	getBlackListed(lowerCaseAddresses){
		const promise = new Promise(async (resolve, reject) => {
			try {
				
				const addresses = lowerCaseAddresses.map(address=>ethers.utils.getAddress(address));
				const result = await this.client.query({
					query: GET_IS_BLACKLISTED,
					variables: { addresses }
				});
				resolve(result.data.bounties);
			}
			catch (e) {
				reject(e);
			}
		}
		);
		return promise;		
	
	}

	getOrgMetadata(organizationId){
	
		const promise = new Promise(async (resolve, reject) => {
			try {
				const result = await this.client.mutate({
					mutation: GET_ORG,
					variables: { organizationId }
				});
				resolve(result.data);
			}
			catch (e) {
				reject(e);
			}
		}
		);
		return promise;	
	
	}

	getOrgsMetadata(organizationIds){
	
		const promise = new Promise(async (resolve, reject) => {
			try {
				const result = await this.client.mutate({
					mutation: GET_ORGS,
					variables: { organizationIds }
				});
				resolve(result.data.organizations);
			}
			catch (e) {
				reject(e);
			}
		}
		);
		return promise;	
	
	}

	addContributor(prId, userId, address){
	
		const promise = new Promise(async (resolve, reject) => {
			try {
				const result = await this.client.mutate({
					mutation: ADD_CONTRIBUTOR,
					variables: { prId, userId, address }
				});
				resolve(result.data);
			}
			catch (e) {
				reject(e);
			}
		}
		);
		return promise;	
	}

	removeContributor(prId, userId){
	
		const promise = new Promise(async (resolve, reject) => {
			try {
				const result = await this.client.mutate({
					mutation: REMOVE_CONTRIBUTOR,
					variables: { prId, userId }
				});
				resolve(result.data);
			}
			catch (e) {
				reject(e);
			}
		}
		);
		return promise;	
	}

	async getUser(userAddress) {
		const promise = new Promise(async (resolve, reject) => {
			try {
				const result = await this.client.query({
					query: GET_USER_BY_HASH,
					variables: { userAddress: ethers.utils.getAddress(userAddress) }
				});
				resolve(result.data.user);
			}
			catch (e) {
				reject(e);
			}
		}
		);
		return promise;
	}

	async getBountyPage(after, limit, orderBy, sortOrder, types, organizationId) {
		const promise = new Promise(async (resolve, reject) => {
			try {
				const result = await this.client.query({
					query: GET_BOUNTY_PAGE,
					variables: { after, limit, orderBy, sortOrder, organizationId, types },
					fetchPolicy: 'no-cache'
				});
				resolve(result.data);
			}
			catch (e) {
				reject(e);
			}
		}
		);
		return promise;
	}
}

export default OpenQPrismaClient;
