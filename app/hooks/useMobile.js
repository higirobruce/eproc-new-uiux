import { message } from "antd";

const useMobile = () => {
    const [messageApi] = message.useMessage();

    const openNotificationWithIcon = (type) => {
        messageApi.open({
            type: type,
            content: 'We are sorry this app works only on IOS & Android, browse on mobile and install it.'
        })
    };

    return {openNotificationWithIcon}
}

export default useMobile;