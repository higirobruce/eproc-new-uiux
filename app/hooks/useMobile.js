import { useEffect } from 'react';
import { message } from 'antd';

function useNotification() {
  const openNotificationWithIcon = (type, content) => {
    return message[type]({
      content: content,
    });
  };

  return openNotificationWithIcon;
}

export default function NotificationComponent() {
  const openNotification = useNotification();

  useEffect(() => {
    openNotification('error', 'This section is best viewed on desktop. For an optimal experience and full feature access, try the app  on a computer.');
  }, []);

  return null;
}