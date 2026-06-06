# Firebase Cloud Messaging Setup för Flutter

## 1. Installera Firebase packages

```bash
flutter pub add firebase_core firebase_messaging
flutter pub get
```

## 2. Firebase-initialisering (main.dart)

```dart
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart'; // Genereras av flutterfire

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  // Request notification permissions (iOS)
  final messaging = FirebaseMessaging.instance;
  final settings = await messaging.requestPermission(
    alert: true,
    announcement: false,
    badge: true,
    carPlay: false,
    criticalAlert: false,
    provisional: false,
    sound: true,
  );

  print('Notification permission: ${settings.authorizationStatus}');

  // Register device token with your backend
  await _registerDeviceToken();

  // Handle notifications
  FirebaseMessaging.onMessage.listen((RemoteMessage message) {
    print('Got a message whilst in the foreground!');
    print('Message data: ${message.data}');
    if (message.notification != null) {
      print('Also got a notification: ${message.notification!.title}');
      // Show local notification or update UI
      _showPaymentNotification(message);
    }
  });

  // Handle notifications when app is opened from background
  FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
    print('Message clicked!');
    _handleNotificationTap(message);
  });

  runApp(const MyApp());
}

Future<void> _registerDeviceToken() async {
  final messaging = FirebaseMessaging.instance;
  final token = await messaging.getToken();
  
  if (token == null) return;

  print('FCM Device Token: $token');
  
  // Send to your backend
  try {
    final response = await http.post(
      Uri.parse('https://din-domain.com/api/notifications/fcm-token'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer \${authToken}', // Your JWT token
      },
      body: jsonEncode({
        'deviceToken': token,
      }),
    );

    if (response.statusCode == 200) {
      print('Device token registered successfully');
    }
  } catch (e) {
    print('Error registering device token: $e');
  }

  // Listen for token changes
  messaging.onTokenRefresh.listen((newToken) {
    print('FCM Token refreshed: $newToken');
    // Send new token to backend
    _registerDeviceToken();
  });
}

void _showPaymentNotification(RemoteMessage message) {
  final notification = message.notification;
  if (notification == null) return;

  // Show local notification or dialog
  showDialog(
    context: navigatorKey.currentContext!,
    builder: (context) => AlertDialog(
      title: Text(notification.title ?? 'Notification'),
      content: Text(notification.body ?? ''),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('OK'),
        ),
        if (message.data['projectId'] != null)
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _handleNotificationTap(message);
            },
            child: const Text('View'),
          ),
      ],
    ),
  );
}

void _handleNotificationTap(RemoteMessage message) {
  final data = message.data;
  final type = data['type'];
  final projectId = data['projectId'];

  // Navigate based on notification type
  if (type == 'payment_confirmed_creator' || type == 'payment_confirmed_client') {
    if (projectId != null && projectId.isNotEmpty) {
      // Navigate to project details
      navigatorKey.currentState?.pushNamed('/project/$projectId');
    } else {
      // Navigate to projects list
      navigatorKey.currentState?.pushNamed('/projects');
    }
  }
}
```

## 3. Unregister token on logout

```dart
Future<void> logout() async {
  final messaging = FirebaseMessaging.instance;
  final token = await messaging.getToken();
  
  if (token != null) {
    // Tell backend to delete token
    await http.delete(
      Uri.parse('https://din-domain.com/api/notifications/fcm-token'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer \${authToken}',
      },
      body: jsonEncode({
        'deviceToken': token,
      }),
    );
  }

  // Delete from Firebase
  await FirebaseMessaging.instance.deleteToken();
  
  // Clear local auth
  // ... din logout-logik
}
```

## 4. Setup för Android (android/app/build.gradle)

Lägg till Google Services plugin:

```gradle
plugins {
  id 'com.android.application'
  id 'kotlin-android'
  id 'dev.flutter.flutter-gradle-plugin'
  id 'com.google.gms.google-services'  // Add this
}
```

## 5. Setup för iOS (ios/Podfile)

Och min_ios_target >= 12.0:

```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)
    target.build_configurations.each do |config|
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= [
        '$(inherited)',
        'FIREBASE_ANALYTICS_COLLECTION_ENABLED=1',
      ]
    end
  end
end
```

## 6. Backend-konfiguration (.env)

```bash
FIREBASE_SERVICE_ACCOUNT_JSON='{
  "type": "service_account",
  "project_id": "din-firebase-project",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}'
```

Du får denna från Firebase Console → Project Settings → Service Accounts → Generate New Private Key.

---

**Efter att ha gjort allt detta:**
- ✅ Flutter-appen registrerar sitt FCM-token när den startar
- ✅ Wayl skickar webhook → Next.js uppdaterar betalningsstatus
- ✅ Next.js skickar push-notifikation till Flutter
- ✅ Användare får omedelbar notifikation om betald betalning

**Testa:**
1. Skapa en betalningslänk
2. Betala via Wayl
3. Kolla console-logs för "FCM Token registered" på backend
4. Du bör få push-notifikation på din Flutter-enhet inom 2-3 sekunder
