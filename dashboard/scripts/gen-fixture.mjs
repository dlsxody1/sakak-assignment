// 실제 CANDiY 응답 구조를 그대로 유지하되, 수치만 가상 인물 값으로 교체한 fixture 생성.
// 판정 5-state(정상/주의/위험/미측정/판정불가)가 모두 등장하도록 값을 의도 배치했다.
//
//   node scripts/gen-fixture.mjs
import { writeFileSync, mkdirSync } from 'node:fs'

// referenceList는 응답마다 변하지 않는 상수(공단 판정기준표)라 실제 응답 그대로 옮겼다.
const referenceList = [
  { refType: '단위', height: 'Cm', weight: 'Kg', waist: 'Cm', BMI: 'kg/m²', vision: '', hearing: '', bloodPressure: 'mmHg', proteinuria: '', hemoglobin: 'g/dL', fastingBloodGlucose: 'mg/dL', totalCholesterol: 'mg/dL', HDLCholesterol: 'mg/dL', triglyceride: 'mg/dL', LDLCholesterol: 'mg/dL', serumCreatinine: 'mg/dL', GFR: 'mL/min', AST: 'U/L', ALT: 'U/L', yGPT: 'U/L', chestXrayResult: '', osteoporosis: '' },
  { refType: '정상(A)', height: '', weight: '', waist: '', BMI: '18.5-24.9', vision: '', hearing: '', bloodPressure: '120미만 이며/80미만', proteinuria: '음성', hemoglobin: '남: 13-16.5 / 여: 12-15.5', fastingBloodGlucose: '100미만', totalCholesterol: '200미만', HDLCholesterol: '60이상', triglyceride: '150미만', LDLCholesterol: '130미만', serumCreatinine: '1.6이하', GFR: '60이상', AST: '40이하', ALT: '35이하', yGPT: '남:11-63 / 여:8-35', chestXrayResult: '정상, 비활동성', osteoporosis: 'T-score -1 이상' },
  { refType: '정상(B)', height: '', weight: '', waist: '', BMI: '18.5미만/25~29.9', vision: '', hearing: '', bloodPressure: '120-139 또는 /80-89', proteinuria: '약양성±', hemoglobin: '남: 12-12.9 / 여: 10-11.9', fastingBloodGlucose: '100-125', totalCholesterol: '200-239', HDLCholesterol: '40-59', triglyceride: '150-199', LDLCholesterol: '130-139', serumCreatinine: '', GFR: '', AST: '41-50', ALT: '36-45', yGPT: '남:64-77 / 여:36-45', chestXrayResult: '', osteoporosis: '-1~-2.5 초과' },
  { refType: '질환의심', height: '', weight: '', waist: '남 90이상 / 여 85이상', BMI: '30이상', vision: '', hearing: '', bloodPressure: '140이상 또는 /90이상', proteinuria: '양성(+1)이상', hemoglobin: '남:12.0미만 / 여:10.0미만', fastingBloodGlucose: '126이상', totalCholesterol: '240이상', HDLCholesterol: '40미만', triglyceride: '200이상', LDLCholesterol: '160이상', serumCreatinine: '1.6초과', GFR: '60미만', AST: '51이상', ALT: '46이상', yGPT: '남:78이상 / 여:46이상', chestXrayResult: '정상 및 비활동성이외의자', osteoporosis: '-2.5이하' },
]

// 오래된 순. 콜레스테롤은 실제 응답처럼 격년만 측정되고, 골밀도는 전 회차 결측이다.
const overviewList = [
  {
    checkupDate: '2020-04-06', height: '171.5', weight: '64.2', waist: '78.0', BMI: '21.8',
    vision: '1.2/1.0', hearing: '정상/정상', bloodPressure: '112/70', proteinuria: '음성',
    hemoglobin: '14.8', fastingBloodGlucose: '88',
    totalCholesterol: '178', HDLCholesterol: '62', triglyceride: '96', LDLCholesterol: '104',
    serumCreatinine: '0.9', GFR: '102', AST: '22', ALT: '19', yGPT: '28',
    chestXrayResult: '정상', osteoporosis: '', evaluation: '정A',
  },
  {
    checkupDate: '2021-05-20', height: '171.6', weight: '68.9', waist: '82.5', BMI: '23.4',
    vision: '1.0/1.0', hearing: '정상/정상', bloodPressure: '118/76', proteinuria: '음성',
    hemoglobin: '15.1', fastingBloodGlucose: '94',
    totalCholesterol: '', HDLCholesterol: '', triglyceride: '', LDLCholesterol: '',
    serumCreatinine: '0.95', GFR: '98', AST: '25', ALT: '27', yGPT: '33',
    chestXrayResult: '정상', osteoporosis: '', evaluation: '정A',
  },
  {
    // LDL 148 → 정상(B) 130-139와 질환의심 160이상 사이 공백. 판정불가(unjudgeable) 케이스.
    checkupDate: '2022-06-11', height: '171.5', weight: '73.4', waist: '86.1', BMI: '25.0',
    vision: '1.0/0.9', hearing: '정상/정상', bloodPressure: '124/79', proteinuria: '음성',
    hemoglobin: '15.4', fastingBloodGlucose: '101',
    totalCholesterol: '212', HDLCholesterol: '48', triglyceride: '162', LDLCholesterol: '148',
    serumCreatinine: '1.0', GFR: '94', AST: '31', ALT: '38', yGPT: '45',
    chestXrayResult: '정상', osteoporosis: '', evaluation: '정B',
  },
  {
    checkupDate: '2023-07-08', height: '171.4', weight: '77.1', waist: '89.4', BMI: '26.2',
    vision: '0.9/0.9', hearing: '정상/정상', bloodPressure: '128/82', proteinuria: '약양성±',
    hemoglobin: '15.6', fastingBloodGlucose: '108',
    totalCholesterol: '', HDLCholesterol: '', triglyceride: '', LDLCholesterol: '',
    serumCreatinine: '1.05', GFR: '90', AST: '35', ALT: '44', yGPT: '58',
    chestXrayResult: '정상', osteoporosis: '', evaluation: '정B',
  },
  {
    // 헤모글로빈 16.8 → 남 정상(A) 상한 16.5 초과. 어느 구간에도 없는 판정불가 케이스.
    checkupDate: '2024-08-22', height: '171.4', weight: '80.8', waist: '92.3', BMI: '27.5',
    vision: '0.9/0.8', hearing: '정상/정상', bloodPressure: '134/86', proteinuria: '음성',
    hemoglobin: '16.8', fastingBloodGlucose: '117',
    totalCholesterol: '228', HDLCholesterol: '43', triglyceride: '186', LDLCholesterol: '135',
    serumCreatinine: '1.1', GFR: '86', AST: '42', ALT: '51', yGPT: '71',
    chestXrayResult: '정상', osteoporosis: '', evaluation: '정B',
  },
  {
    // 최신 회차. 혈압 142/88은 "140이상 또는 /90이상"의 OR 조건에서 수축기만 걸린다.
    checkupDate: '2025-09-16', height: '171.3', weight: '84.5', waist: '95.7', BMI: '28.8',
    vision: '0.8/0.8', hearing: '정상/정상', bloodPressure: '142/88', proteinuria: '양성(+1)',
    hemoglobin: '15.2', fastingBloodGlucose: '129',
    totalCholesterol: '246', HDLCholesterol: '38', triglyceride: '214', LDLCholesterol: '166',
    serumCreatinine: '1.15', GFR: '82', AST: '48', ALT: '63', yGPT: '84',
    chestXrayResult: '정상', osteoporosis: '', evaluation: '의심',
  },
]

// 실제 응답과 동일하게 날짜별 [일반, 구강] 세트가 최신순으로 온다.
const resultList = [...overviewList]
  .reverse()
  .flatMap(({ checkupDate }) => [
    { caseType: 0, checkupType: '일반', checkupDate, organizationName: '가온종합건진센터', pdfData: '', checkupFindings: '', questionnaire: [], infantsCheckupList: [], infantsDentalList: [] },
    { caseType: 0, checkupType: '구강', checkupDate, organizationName: '가온치과의원', pdfData: '', checkupFindings: '', questionnaire: [], infantsCheckupList: [], infantsDentalList: [] },
  ])

const response = {
  status: 'success',
  data: { patientName: '김건강', overviewList, referenceList, resultList },
}

const dir = 'src/shared/api/__fixtures__'
mkdirSync(dir, { recursive: true })
writeFileSync(`${dir}/checkup-response.json`, JSON.stringify(response, null, 2) + '\n')
console.log(`✅ ${dir}/checkup-response.json — overview ${overviewList.length}건 / result ${resultList.length}건`)
