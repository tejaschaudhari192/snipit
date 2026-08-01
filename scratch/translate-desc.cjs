const fs = require('fs');
const path = require('path');
const localesDir = 'c:\\programming\\Projects\\snipit\\frontend\\src\\locales';
const translations = {
  de: 'Diese Aktion kann nicht rückgängig gemacht werden. Dadurch werden die ausgewählten Elemente dauerhaft gelöscht.',
  ja: 'この操作は取り消すことができません。選択したアイテムは完全に削除されます。',
  hi: 'इस कार्रवाई को पूर्ववत नहीं किया जा सकता। यह चयनित आइटम को स्थायी रूप से हटा देगा।',
  mr: 'ही कृती अन्डू केली जाऊ शकत नाही. हे निवडलेले आयटम कायमचे हटवेल.',
  bn: 'এই কাজ বাতিল করা যাবে না। এটি নির্বাচিত আইটেম স্থায়ীভাবে মুছে ফেলবে।',
  te: 'ఈ చర్య వెనక్కి తీసుకోబడదు. ఇది ఎంచుకున్న అంశాలను శాశ్వతంగా తొలగిస్తుంది.',
  ta: 'இச்செயலை செயல்தவிர்க்க முடியாது. இது தேர்ந்தெடுக்கப்பட்ட உருப்படிகளை நிரந்தரமாக அழித்துவிடும்.',
  ur: 'اس عمل کو واپس نہیں لیا جا سکتا۔ یہ منتخب آئٹمز کو ہمیشہ کے لیے حذف کر دے گا۔',
  gu: 'આ ક્રિયા રદ કરી શકાતી નથી. તે પસંદ કરેલી આઇટમ્સને કાયમ માટે કાઢી નાખશે.',
  pa: 'ਇਹ ਕਾਰਵਾਈ ਰੱਦ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕਦੀ। ਇਹ ਚੁਣੀਆਂ ਗਈਆਂ ਆਈਟਮਾਂ ਨੂੰ ਪੱਕੇ ਤੌਰ \'ਤੇ ਮਿਟਾ ਦੇਵੇਗਾ।',
  ml: 'ഈ പ്രവർത്തനം പിൻവലിക്കാൻ കഴിയില്ല. ഇത് തിരഞ്ഞെടുത്ത ഇനങ്ങൾ പൂർണ്ണമായി മായ്ക്കും.',
  kn: 'ಈ ಕ್ರಿಯೆಯನ್ನು ಹಿಂತೆಗೆದುಕೊಳ್ಳಲಾಗುವುದಿಲ್ಲ. ಇದು ಆಯ್ಕೆಮಾಡಿದ ಐಟಂಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸುತ್ತದೆ.'
};

const files = fs.readdirSync(localesDir);
for (const file of files) {
  if (file.endsWith('.json') && file !== 'en.json') {
    const lang = file.replace('.json', '');
    const filePath = path.join(localesDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (translations[lang]) {
      if (content.tools) {
        content.tools.password_manager_delete_desc = translations[lang];
        fs.writeFileSync(filePath, JSON.stringify(content, null, '\t') + '\n');
        console.log('Translated ' + file);
      }
    }
  }
}
