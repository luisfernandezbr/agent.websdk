import React from 'react';
import moment from 'moment';
import { Banner, Button, Icon, Tooltip } from '@pinpt/uic.next';
import { Publisher } from './types';
import styles from './styles.less';

interface HeaderProps {
	enabled: boolean;
	installed: boolean;
	authorized: boolean;
	authDate?: number;
	authName?: string;
	name: string;
	description: string;
	tags: string[];
	icon: React.ReactElement | string;
	publisher: Publisher;
	hasError: boolean;
	errorMessage: string;
	handleInstall: (action: 'install' | 'remove') => void;
	handleChangeAuth: () => void;
}

export const Header = (props: HeaderProps) => {
	return (
		<div className={styles.Header}>
			<div className={styles.Row}>
				{
					typeof(props.icon) === 'string' ? (
						<img src={props.icon} alt={props.name} className={styles.Icon} />
					) : (
						<span className={styles.Icon}>
							{props.icon}
						</span>
					)
				}

				<div className={styles.Details}>
					<div className={styles.Title}>
						<div className={styles.Name}>
							{props.name}
						</div>

						<div className={styles.Tags}>
							{
								props.tags.map(tag => (
									<span key={tag} className={styles.Tag}>
										{tag}
									</span>
								))
							}
						</div>
					</div>

					<div className={styles.Description}>
						{props.description}
					</div>

					<div className={styles.Publisher}>
						<span>
							Published by
						</span>
				
						<a target="_blank" href={props.publisher.url} rel="noopener noreferrer">
							<img alt={props.publisher.name} src={props.publisher.avatar} />
							{props.publisher.name}
						</a>
					</div>
				</div>

				{
					props.authorized && props.authDate && props.installed && (
						<Tooltip
							content={<>Last authorized on {moment(props.authDate, 'x').format('MMM Do, YYYY')} by {props.authName}</>}
							className={styles.Button}
						>
							<Button
								onClick={props.handleChangeAuth}
								color="Mono"
								weight={300}
							>
								<>
									<Icon icon={['fas', 'key']} />
									Change Credentials
								</>
							</Button>
						</Tooltip>
					)
				}

				<Button
					onClick={() => props.handleInstall('remove')}
					color="Red"
					weight={500}
					className={styles.Button}
				>
					<>
						<Icon icon={['fas', 'trash']} />
						Uninstall
					</>
				</Button>

				{
					!props.installed && (
						<Button
							onClick={() => props.handleInstall('install')}
							color="Green"
							weight={500}
							disabled={!props.enabled}
							className={styles.Button}
						>
							<>
								<Icon icon={['fas', 'check']} />
								Install
							</>
						</Button>
					)
				}
			</div>

			{
				props.hasError && (
					<div className={styles.Row}>
						<Banner error className={styles.Error}>
							<>
								<Icon icon={['fas', 'exclamation-triangle']} />
								{props.errorMessage}
							</>
						</Banner>
					</div>
				)
			}
		</div>
	);
};
