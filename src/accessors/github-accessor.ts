import * as github from "github";
import * as pfs from "../utilities/promisified_fs";
import path = require("path");
import os = require("os");
// import app_root_path = require("app-root-path");
import promptly = require("promptly");
import ini = require("ini");
import * as logger from "../utilities/logger";

import * as dependencyAccessor from "./dependency-accessor";
// import { cancel, download } from "./download-accessor";

import { node_package } from "./package-accessor";

const GITHUB_APPLICATION_NAME = "github-node-publisher";
const THIS_PACKAGE_NAME = GITHUB_APPLICATION_NAME;

// tslint:disable-next-line:max-line-length
const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const AuthenticationFilename = ".github-authentication-cache";

interface IAuthenticationCache {
	token: string;
}

export interface IApplication {
	name: string;
	url: string;
	client_id: string;
}

export interface IReply<T> {
	data: T[] | T;
	meta: { [meta_id: string]: string };
}

export interface IAuthorization {
	id: number;
	url: string;
	app: IApplication;
	token: string;
	hashed_token: string;
	token_last_eight: string;
	note: string;
	note_url: string;
	created_at: Date;
	updated_at: Date;
	scopes: string[];
	fingerprint: string;
}

export interface IOwner {
	"login": string;
	"id": number;
	"avatar_url": string;
	"gravatar_id": string;
	"url": string;
	"html_url": string;
	"followers_url": string;
	"following_url": string;
	"gists_url": string;
	"starred_url": string;
	"subscriptions_url": string;
	"organizations_url": string;
	"repos_url": string;
	"events_url": string;
	"received_events_url": string;
	"type": string;
	"site_admin": boolean;
}

export interface IPermission {
	admin: boolean;
	push: boolean;
	pull: boolean;
}

export interface IRepo {
	"id": number;
	"owner": IOwner;
	"name": string;
	"full_name": string;
	"description": string;
	"private": boolean;
	"fork": boolean;
	"url": string;
	"html_url": string;
	"archive_url": string;
	"assignees_url": string;
	"blobs_url": string;
	"branches_url": string;
	"clone_url": string;
	"collaborators_url": string;
	"comments_url": string;
	"commits_url": string;
	"compare_url": string;
	"contents_url": string;
	"contributors_url": string;
	"deployments_url": string;
	"downloads_url": string;
	"events_url": string;
	"forks_url": string;
	"git_commits_url": string;
	"git_refs_url": string;
	"git_tags_url": string;
	"git_url": string;
	"hooks_url": string;
	"issue_comment_url": string;
	"issue_events_url": string;
	"issues_url": string;
	"keys_url": string;
	"labels_url": string;
	"languages_url": string;
	"merges_url": string;
	"milestones_url": string;
	"mirror_url": string;
	"notifications_url": string;
	"pulls_url": string;
	"releases_url": string;
	"ssh_url": string;
	"stargazers_url": string;
	"statuses_url": string;
	"subscribers_url": string;
	"subscription_url": string;
	"svn_url": string;
	"tags_url": string;
	"teams_url": string;
	"trees_url": string;
	"homepage": string;
	"language": any;
	"forks_count": number;
	"stargazers_count": number;
	"watchers_count": number;
	"size": number;
	"default_branch": string;
	"open_issues_count": number;
	"has_issues": boolean;
	"has_wiki": boolean;
	"has_pages": boolean;
	"has_downloads": boolean;
	"pushed_at": Date;
	"created_at": Date;
	"updated_at": Date;
	"permissions": IPermission;
}

export interface IUser {
	"login": string;
	"id": number;
	"avatar_url": string;
	"gravatar_id": string;
	"url": string;
	"html_url": string;
	"followers_url": string;
	"following_url": string;
	"gists_url": string;
	"starred_url": string;
	"subscriptions_url": string;
	"organizations_url": string;
	"repos_url": string;
	"events_url": string;
	"received_events_url": string;
	"type": string;
	"site_admin": boolean;
}

export interface IAsset {
	"url": string;
	"browser_download_url": string;
	"id": number;
	"name": string;
	"label": string;
	"state": string;
	"content_type": string;
	"size": number;
	"download_count": number;
	"created_at": Date;
	"updated_at": Date;
	"uploader": IUser;
}

export interface IRelease {
	url: string;
	html_url: string;
	assets_url: string;
	upload_url: string;
	tarball_url: string;
	zipball_url: string;
	id: number;
	tag_name: string;
	target_commitish: string;
	name: string;
	body: string;
	draft: boolean;
	prerelease: boolean;
	created_at: Date;
	published_at: Date;
	author: IUser;
	assets: IAsset[];
}

export interface IErrorDetail {
	resource: string;
	code: string;
	field: string;
}

export interface IErrorMessage {
	message: string;
	request_id: string;
	documentation_url: string;
	errors: IErrorDetail[];
}

export interface IError {
	code: number;
	status: string;
	message: string;
}

export class GitHubAccessor {
	private _auth_cache_filename = path.join(os.homedir(), AuthenticationFilename);
	private _github = new github();
	private _authentication: github.AccessToken;
	private _authenticated = false;

	public async authenticate() {
		if (this._authenticated) {
			return true;
		}

		console.log("checking existing file");
		if (await pfs.exists(this._auth_cache_filename)) {
			try {
				this._authentication = JSON.parse(await pfs.readFile(this._auth_cache_filename, "utf8"));
			} catch (e) {
				logger.warn(`unable to parse authentication cache file ${AuthenticationFilename}, please delete and retry`);
			}
		}

		console.log("testing authentication");
		if (this._authentication) {
			if (await this.test_authentication()) {
				this._authenticated = true;
				return true;
			} else {
				logger.info("cached authentication failed");
				this._authentication = null;
			}
		}

		console.log("checking console");
		if (!this._authentication) {
			// do console authentication
			let success = await this.console_authentication();
			if (success) {
				this._authenticated = true;
			}
			return success;
		}

	}

	public async console_authentication() {
		let useremail = await this.prompt_email();
		let password = await this.prompt_password();

		this._github.authenticate({
			type: "basic",
			username: useremail,
			password
		});
		let authorizations: IReply<IAuthorization> = await this._github.authorization.getAll({});
		let authorization = (authorizations.data as IAuthorization[]).find((v) =>
			v.note === THIS_PACKAGE_NAME && (v.scopes.indexOf("public_repo") !== -1)
		);
		if (authorization) {
			logger.info("existing authorization found, but we can't use it since there is no way to get its token");
			let should_recreate = await this.confirm("delete current token and recreate?");
			if (should_recreate) {
				let success = await this._github.authorization.delete({ id: authorization.id.toString() });
				if (success) {
					logger.info("deleted successfully");
				} else {
					logger.error("failed to delete token");
					return false;
				}
			}
		}

		let new_token: IReply<IAuthorization> = await this._github.authorization.create({
			scopes: ["public_repo"],
			note: THIS_PACKAGE_NAME
		});

		if (!new_token || !new_token.data) {
			logger.error("failed to generate new authorization token");
			return false;
		}

		this.save_token({
			access_token: (new_token.data as IAuthorization).token
		});
		return true;
	}

	public async get_repo(owner: string, repo: string): Promise<IRepo> {
		let result: IRepo = await this._github.repos.get({ owner, repo });
		return result;
	}

	public async get_repos(owner: string): Promise<IRepo[]> {
		let results: IRepo[] = await this._github.repos.getAll({});
		return results;
	}

	public async get_releases(owner: string, repo: string): Promise<IReply<IRelease>> {
		let results: IReply<IRelease> = (await this._github.repos.getReleases({ owner, repo })).data;
		return results;
	}

	public async get_releases_by_tag(owner: string, repo: string, tag: string): Promise<IReply<IRelease>> {
		let results: IReply<IRelease> = await this._github.repos.getReleaseByTag({ owner, repo, tag });
		return results;
	}

	public async create_release(owner: string, repo: string, tag_name: string, name: string, draft: boolean): Promise<IRelease> {
		await this.authenticate();
		let release: IRelease = await this._github.repos.createRelease({
			owner,
			repo,
			tag_name,
			name,
			body: "generated by node-native-build-utilities",
			draft
		});
		return release;
	}

	public async upload_release_asset(owner: string, repo: string, release_id: string, filePath: string, name: string, label?: string) {
		await this.authenticate();

		let asset: IReply<IAsset> = await this._github.repos.uploadAsset({
			owner, repo, id: release_id,
			filePath, name, label
		});
		return asset;
	}

	public async download_asset(owner: string, repo: string, release_name: string, filename: string, localfilename: string) {
		let downloadurl = `https://github.com/${owner}/${repo}/releases/download/${release_name}/${filename}`;
		await dependencyAccessor.get_package(downloadurl, localfilename);
	}

	private async test_authentication(): Promise<boolean> {
		try {
			this._github.authenticate({
				type: "oauth",
				token: this._authentication.access_token
			});
			let user = await this._github.users.get({});
			return (user != null);
		} catch (e) {
			logger.debug("unable to check authentication", e);
			return false;
		}
	}

	private async read_default_email() {
		const config_filename = path.join(process.cwd(), ".git/", "./config");
		if (!(await pfs.exists(config_filename))) {
			logger.warn("git is not configured for this repository");
			return "";
		}
		let gitconfig = ini.parse(await pfs.readFile(config_filename, "utf-8"));
		if (gitconfig && gitconfig.user && gitconfig.user.email) {
			return gitconfig.user.email;
		}

		logger.warn("email not found in git");
		return "";
	}

	private async save_token(token: github.AccessToken) {
		let success = await pfs.writeFile(this._auth_cache_filename, "utf8", JSON.stringify(token, null, "\t"));
		if (!success) {
			logger.error("unable to save token, read only?");
		}
		this._authentication = token;
	}

	private confirm(message: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			promptly.confirm(message, (err: Error, value: string) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(<boolean> <any> value);
			});
		});
	}

	private prompt_email(): Promise<string> {
		return new Promise<string>(async (resolve, reject) => {
			let defaultUsername = await this.read_default_email();

			let emailValidator = (value: string): string => {
				if (email_regex.test(value)) {
					return value;
				}
				throw new Error(value + " is not an email");
			};

			promptly.prompt(`Github username${(defaultUsername) ? "(" + defaultUsername + ")" : ""}: `, {
				default: defaultUsername,
				trim: true,
				validator: emailValidator,
				retry: true
			}, (err: Error, value: string) => {
				if (err) {
					reject(err);
					return;
				}
				if (value) {
					resolve(value);
				}
				reject("no email entered");
			});
		});
	}

	private prompt_password(): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			promptly.password("password: ", (err: Error, value: string) => {
				if (err) {
					reject(err);
					return;
				}
				if (value) {
					resolve(value);
				}
				reject("no password entered");
			});
		});
	}

}
