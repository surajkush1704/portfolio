import * as admin from 'firebase-admin'

if (admin.apps.length === 0) {
  admin.initializeApp()
}

export { chatWithXal } from './chat'
export { sendEnquiryNotification } from './email'
export { getAdminReport } from './analytics'
