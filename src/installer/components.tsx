import React from 'react';
import { Button, Icon } from '@pinpt/uic.next';
import { Publisher } from './types';
import styles from './styles.less';

const Tags = ({ tags }: { tags: string[] }) => (
	<div>
		{tags.map(tag => <span key={tag} className={styles.Tag}>{tag}</span>)}
	</div>
);

const Indicator = ({ on, errored, message }: { on: boolean, errored: boolean, message?: string }) => (
	<div className={styles.Indicator}>
		<div className={[styles.IndicatorCircle, errored ? styles.Errored : on ? styles.Installed : styles.NotInstalled ].join(' ')} />
		<div className={[styles.IndicatorText, errored ? styles.Errored : on ? styles.Installed : styles.NotInstalled ].join(' ')}>
			{ errored ? message : on ? 'Installed' : 'Not Installed' }
		</div>
	</div>
);

const ProductIcon = ({ icon }: { icon: React.ReactElement | string }) => {
	if (typeof(icon) === 'string') {
		return <img alt="" src={icon} width="48" />
	}
	return (
		<span style={{width: '48px'}}>{icon}</span>	
	);
}

const PublisherName = ({ name }: { name: string }) => (
	<div className={styles.PublisherName}>
		{name}
	</div>
);

const PublisherInfo = ({ publisher }: { publisher: Publisher }) => {
	return (
		<div className={styles.PublisherInfo}>
			<span>Published by</span>
			<a target="_blank" href={publisher.url} rel="noopener noreferrer">
				<img alt="" src={publisher.avatar} width="20" />
				{publisher.name}
			</a>
		</div>
	);
};

const Description = ({children}: { children: string }) => (
	<div className={styles.Description}>
		{children}
	</div>
);

const PublisherDetail = ({name, installed, tags, description, publisher, errored, errorMessage}: {name: string, installed: boolean, tags: string[], description: string, publisher: Publisher, errored: boolean, errorMessage?: string}) => (
	<div className={styles.PublisherDetail}>
		<div>
			<PublisherName name={name} />
			<Indicator on={installed} errored={errored} message={errorMessage} />
		</div>
		<Tags tags={tags} />
		<PublisherInfo publisher={publisher} />
		<Description>{description}</Description>
	</div>
);

const InstallButton = ({enabled, installed, onClick}: { enabled: boolean, installed: boolean, onClick: () => void }) => {
	if (installed) {
		return (
			<Button onClick={onClick} style={{width: '90px'}} color="Red" weight={500} disabled={!enabled}><Icon icon={['fas', 'trash']} /><span>Uninstall</span></Button>
		);
	}
	return (
		<Button onClick={onClick} style={{width: '90px'}} color="Green" weight={500} disabled={!enabled}><Icon icon={['fas', 'check']} /><span>Install</span></Button>
	);
};

export const Header = ({ enabled, installed, name, description, tags, icon, publisher, errored, errorMessage, onClick }: { enabled: boolean, installed: boolean, name: string, description: string, tags: string[], icon: React.ReactElement | string, publisher: Publisher, errored: boolean, errorMessage?: string, onClick: () => void }) => {
	return (
		<>
			<div className={styles.Header}>
				<ProductIcon icon={icon} />
				<PublisherDetail
					name={name}
					installed={installed}
					tags={tags}
					description={description}
					publisher={publisher}
					errored={errored}
					errorMessage={errorMessage}
				/>
				<InstallButton enabled={enabled} installed={installed} onClick={onClick} />
			</div>
		</>
	);
};
