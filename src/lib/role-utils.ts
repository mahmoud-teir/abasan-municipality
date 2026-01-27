
export function getDashboardLink(role?: string | null) {
    if (!role) return '/citizen/dashboard';

    switch (role) {
        case 'SUPER_ADMIN':
        case 'ADMIN':
            return '/admin';
        case 'EMPLOYEE':
        case 'ENGINEER':
        case 'ACCOUNTANT':
        case 'PR_MANAGER':
            return '/employee';
        default:
            return '/citizen/dashboard';
    }
}

export function getSettingsLink(role?: string | null) {
    if (!role) return '/citizen/settings';

    switch (role) {
        case 'SUPER_ADMIN':
        case 'ADMIN':
            return '/admin/settings';
        case 'EMPLOYEE':
        case 'ENGINEER':
        case 'ACCOUNTANT':
        case 'PR_MANAGER':
            return '/employee/settings';
        default:
            return '/citizen/settings';
    }
}
