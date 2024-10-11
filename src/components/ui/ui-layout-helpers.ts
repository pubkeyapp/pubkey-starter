import { useComputedColorScheme, useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { NotificationData, notifications } from '@mantine/notifications'

export function ellipsify(str = '', len = 4) {
  if (str.length > 30) {
    return str.substring(0, len) + '..' + str.substring(str.length - len, str.length)
  }
  return str
}

export function useIsDark() {
  const computed = useComputedColorScheme('dark')

  return computed === 'dark'
}

export function useIsMobile() {
  const { breakpoints } = useMantineTheme()

  return useMediaQuery(`(max-width: ${breakpoints.sm})`)
}

export type ToastProps = string | NotificationData

export function toastSuccess(notification: ToastProps) {
  notification = typeof notification === 'string' ? { message: notification } : notification
  notifications.show({
    color: notification?.color ?? 'green',
    title: notification?.title ?? 'Success',
    message: notification?.message,
  })
}

export function toastError(notification: ToastProps) {
  notification = typeof notification === 'string' ? { message: notification } : notification
  notifications.show({
    color: notification?.color ?? 'red',
    title: notification?.title ?? 'Error',
    message: notification?.message,
  })
}
export function toastWarning(notification: ToastProps) {
  notification = typeof notification === 'string' ? { message: notification } : notification
  notifications.show({
    color: notification?.color ?? 'yellow',
    title: notification?.title ?? 'Warning',
    message: notification?.message,
  })
}
export function toastInfo(notification: ToastProps) {
  notification = typeof notification === 'string' ? { message: notification } : notification
  notifications.show({
    color: notification?.color ?? 'cyan',
    title: notification?.title ?? 'Info',
    message: notification?.message,
  })
}
