import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { logout as logoutAction } from '@/lib/store/slices/authSlice';
import { useLogoutMutation } from '@/lib/store/api/authApi';

export function useAuth() {
    const dispatch = useAppDispatch();
    const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
    const [logoutApi] = useLogoutMutation();

    const logout = async () => {
        try {
            await logoutApi().unwrap();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            // Ensure local state is cleared even if API call fails
            dispatch(logoutAction());
        }
    };

    return {
        user,
        isAuthenticated,
        loading: isLoading,
        logout,
    };
}
