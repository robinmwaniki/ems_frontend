import { client } from './client'
import type { CompanyProfile } from '@/types/api'
export const companyProfileApi = {
 get: () => client.get<CompanyProfile>('/api/company-profile').then(r=>r.data),
 update: (data:CompanyProfile) => client.put<CompanyProfile>('/api/company-profile',data).then(r=>r.data),
}
