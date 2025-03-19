import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Login: undefined;
  SignUp: undefined;
};

type SignUpScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

const SignUpScreen = ({navigation}: SignUpScreenProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteStyle, setFavoriteStyle] = useState('animals');
  const [gender, setGender] = useState('male');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const styleOptions = [
    {label: 'Animals', value: 'animals'},
    {label: 'Portrait', value: 'portrait'},
    {label: 'Sport', value: 'sport'},
    {label: 'Nature', value: 'nature'},
  ];

  const genderOptions = [
    {label: 'Male', value: 'male'},
    {label: 'Female', value: 'female'},
  ];

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 100; i <= currentYear - 18; i++) {
      years.push({label: i.toString(), value: i});
    }
    return years;
  };

  const generateMonthOptions = () => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months.map((month, index) => ({
      label: month,
      value: index + 1,
    }));
  };

  const generateDayOptions = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({label: i.toString(), value: i});
    }
    return days;
  };

  const yearOptions = generateYearOptions();
  const monthOptions = generateMonthOptions();
  const dayOptions = generateDayOptions(
    dateOfBirth.getFullYear(),
    dateOfBirth.getMonth() + 1,
  );

  const handleSignUp = async () => {
    if (!username || !email || !password || !confirmPassword || !bio) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5001/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          username,
          age: dateOfBirth.toISOString(),
          gender,
          bio,
          favorite_style: favoriteStyle,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Error', data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Failed to sign up. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm password"
          secureTextEntry
        />

        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}>
          <Text style={styles.pickerButtonText}>
            {dateOfBirth.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Date of Birth</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalCloseText}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.datePickerContainer}>
                <ScrollView style={styles.datePickerScroll}>
                  <Text style={styles.datePickerLabel}>Year</Text>
                  {yearOptions.map(year => (
                    <TouchableOpacity
                      key={year.value}
                      style={[
                        styles.dateOptionButton,
                        dateOfBirth.getFullYear() === year.value &&
                          styles.selectedOption,
                      ]}
                      onPress={() => {
                        const newDate = new Date(dateOfBirth);
                        newDate.setFullYear(year.value);
                        setDateOfBirth(newDate);
                      }}>
                      <Text
                        style={[
                          styles.dateOptionText,
                          dateOfBirth.getFullYear() === year.value &&
                            styles.selectedOptionText,
                        ]}>
                        {year.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <ScrollView style={styles.datePickerScroll}>
                  <Text style={styles.datePickerLabel}>Month</Text>
                  {monthOptions.map(month => (
                    <TouchableOpacity
                      key={month.value}
                      style={[
                        styles.dateOptionButton,
                        dateOfBirth.getMonth() + 1 === month.value &&
                          styles.selectedOption,
                      ]}
                      onPress={() => {
                        const newDate = new Date(dateOfBirth);
                        newDate.setMonth(month.value - 1);
                        setDateOfBirth(newDate);
                      }}>
                      <Text
                        style={[
                          styles.dateOptionText,
                          dateOfBirth.getMonth() + 1 === month.value &&
                            styles.selectedOptionText,
                        ]}>
                        {month.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <ScrollView style={styles.datePickerScroll}>
                  <Text style={styles.datePickerLabel}>Day</Text>
                  {dayOptions.map(day => (
                    <TouchableOpacity
                      key={day.value}
                      style={[
                        styles.dateOptionButton,
                        dateOfBirth.getDate() === day.value &&
                          styles.selectedOption,
                      ]}
                      onPress={() => {
                        const newDate = new Date(dateOfBirth);
                        newDate.setDate(day.value);
                        setDateOfBirth(newDate);
                      }}>
                      <Text
                        style={[
                          styles.dateOptionText,
                          dateOfBirth.getDate() === day.value &&
                            styles.selectedOptionText,
                        ]}>
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </Modal>

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          placeholder="Enter your bio"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Gender</Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setShowGenderPicker(true)}>
          <View style={styles.pickerButton}>
            <Text style={styles.pickerButtonText}>
              {genderOptions.find(g => g.value === gender)?.label ||
                'Select Gender'}
            </Text>
            <Text style={styles.pickerButtonText}>▼</Text>
          </View>
        </TouchableOpacity>

        <Modal
          visible={showGenderPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowGenderPicker(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Gender</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowGenderPicker(false)}>
                  <Text style={styles.modalCloseText}>Done</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.optionsContainer}>
                {genderOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      gender === option.value && styles.selectedOption,
                    ]}
                    onPress={() => {
                      setGender(option.value);
                      setShowGenderPicker(false);
                    }}>
                    <Text
                      style={[
                        styles.optionText,
                        gender === option.value && styles.selectedOptionText,
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Text style={styles.label}>Favorite Style</Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setShowStylePicker(true)}>
          <View style={styles.pickerButton}>
            <Text style={styles.pickerButtonText}>
              {styleOptions.find(s => s.value === favoriteStyle)?.label ||
                'Select Style'}
            </Text>
            <Text style={styles.pickerButtonText}>▼</Text>
          </View>
        </TouchableOpacity>

        <Modal
          visible={showStylePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowStylePicker(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Style</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowStylePicker(false)}>
                  <Text style={styles.modalCloseText}>Done</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.optionsContainer}>
                {styleOptions.map(style => (
                  <TouchableOpacity
                    key={style.value}
                    style={[
                      styles.optionButton,
                      favoriteStyle === style.value && styles.selectedOption,
                    ]}
                    onPress={() => {
                      setFavoriteStyle(style.value);
                      setShowStylePicker(false);
                    }}>
                    <Text
                      style={[
                        styles.optionText,
                        favoriteStyle === style.value &&
                          styles.selectedOptionText,
                      ]}>
                      {style.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Join</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  pickerButton: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    color: '#333',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    height: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 10,
  },
  modalCloseText: {
    color: 'rgb(0, 135, 251)',
    fontSize: 16,
  },
  optionsContainer: {
    maxHeight: 300,
  },
  optionButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedOption: {
    backgroundColor: 'rgb(0, 135, 251)',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: 'white',
  },
  button: {
    backgroundColor: 'rgb(0, 135, 251)',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePickerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  datePickerScroll: {
    flex: 1,
    marginHorizontal: 5,
  },
  datePickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  dateOptionButton: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default SignUpScreen;
