export interface IntegrationProps {
    // setEnable should be called to enable to "Install" button to indicate the integration is ready
    setEnabled: (enabled: boolean) => void;
    // setConfig should be called with any specific configuration that the integration needs
    setConfig: (config: {[key: string]: any}) => void;
}
