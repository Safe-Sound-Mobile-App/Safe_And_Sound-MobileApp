import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const editProfileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 30,
  },

  // Title
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    color: '#374151',
    marginTop: 40,
    marginBottom: 30,
  },

  // Form
  form: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 8,
    position: 'relative',
  },
  inputError: {
    borderBottomColor: '#ef4444',
  },
  inputIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    tintColor: '#6b7280',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'BalooBhaijaan2_400Regular',
    color: '#374151',
    paddingVertical: 8,
  },
  requiredMark: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: '700',
    position: 'absolute',
    right: 0,
  },

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 40,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    letterSpacing: 0.5,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    letterSpacing: 0.5,
  },
});