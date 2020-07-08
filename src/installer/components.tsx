import React from 'react';
import { Banner, Button, Icon, Theme } from '@pinpt/uic.next';
import { Publisher } from './types';
import styles from './styles.less';

interface HeaderProps {
	enabled: boolean,
	installed: boolean,
	name: string,
	description: string,
	tags: string[],
	icon: React.ReactElement | string,
	publisher: Publisher,
	hasError: boolean,
	errorMessage: string,
	onClick: () => void
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

				<Button
					onClick={props.onClick}
					color="Mono"
					weight={300}
					className={styles.Button}
				>
					<>
						<Icon icon={['fas', 'key']} />
						Change Login
					</>
				</Button>

				{
					props.installed ? (
						<Button
							onClick={props.onClick}
							color="Red"
							weight={500}
							disabled={!props.enabled}
							className={styles.Button}
						>
							<>
								<Icon icon={['fas', 'trash']} />
								Uninstall
							</>
						</Button>
					) : (
						<Button
							onClick={props.onClick}
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
								<Icon color={Theme.Red500} icon={['fas', 'exclamation-triangle']} />
								{props.errorMessage}
							</>
						</Banner>
					</div>
				)
			}
		</div>
	);
};
