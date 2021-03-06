import React from 'react'
import {Form, Input, Button, Row, Col,DatePicker,TimePicker,Radio} from 'antd'
import {   Link } from 'react-router-dom'
import '../../css/Form.css'
import moment from 'moment'

const { TextArea } = Input
const RadioGroup = Radio.Group;
const API_TOKEN = require('../../api/Token')
const API_ASSIGNMENT_STUDENT = require('../../api/Assignment_Student')
const API_ASSIGNMENT_ADMIN = require('../../api/Assignment_Admin')
const format = 'HH:mm'

class Form_8 extends React.Component {
    
    constructor(props){
        super(props)
        this.state = {
            defaultForm: 8,
            token_username: "",
            token_status: "student",
            readonly: "value"
        }
    }

    getCurrentId = (year) => {
        let params = {defaultForm: this.state.defaultForm, year: year}
        API_ASSIGNMENT_ADMIN.POST_DEADLINE_DEFAULTFORM_YEAR(params)
        .then(response => {
            if(response.code === 1){
                console.log(response.data)
            }
        })
    }

    updateDeadline = (id, year, newDeadline) => {
        let params = {id: id, year: year, deadline: newDeadline}
        API_ASSIGNMENT_ADMIN.POST_UPDATE_DEADLINE_FORMREVIEW(params)
        .then(response => {
            if(response.code === 1){
                console.log("yeah!")
            }
        })
    }

    POST_FORM_DATA = (username) => {
        let params = {username: username, defaultForm: this.state.defaultForm}
        const forms = this.props.form
        API_ASSIGNMENT_STUDENT.POST_FORM_DATA(params)
        .then(response => {
            if(response.code === 1){
                // console.log(response.data)
                if(response.data[0].formData.f4_companyName === "" || response.data[0].formData.f5_sup_division === ""){
                    // if no data from previous form
                    API_ASSIGNMENT_STUDENT.POST_DATA_PREVIOUS_FORM(params)
                    .then(tmp => {
                        let params = {}
                        let tmpObj = tmp.data
                        let responseObj = response.data[0].formData
                        Object.keys(response.data[0].formData).forEach(key => params[key] = responseObj[key])
                        Object.keys(tmp.data).forEach(key => params[key] = tmpObj[key])
                        // console.log(params)
                        forms.setFieldsValue(params)
                        let readonlyVal = this.state.token_status === "admin"? "readOnly":"value"
                        this.setState({readonly:readonlyVal}) 
                    })                    
                }else{
                    // console.log(response.data[0].formData)
                    forms.setFieldsValue(response.data[0].formData)
                    let readonlyVal = this.state.token_status === "admin"? "readOnly":"value"
                    this.setState({readonly:readonlyVal}) 
                }
            }
        })
    }

    POST_CHECK_TOKEN = () => {
        console.log("idStudent ", this.props.match.params.idStudent)
        let token = {'token': window.localStorage.getItem('token_senior_project')}
        API_TOKEN.POST_CHECK_TOKEN(token)
        .then(response => {
            let username = response.token_username
            let status = response.token_status
            if(status === "admin"){
                this.POST_FORM_DATA(this.props.match.params.idStudent)
            }else if(status === "student"){
                this.POST_FORM_DATA(username)
            }else{
                let username = this.props.match.params.username
                let supervisor = this.props.match.params.supervisor
                let id = this.props.match.params.id
                if(supervisor === "supervisor" && id === "123"){
                    this.POST_FORM_DATA(username)
                }
            }
            this.setState({token_username: username, token_status: status})
        })
    }

    POST_UPDATE_FORM = (values) => {
        let params = {username: this.state.token_username, defaultForm: this.state.defaultForm, formData: values, status: 1, statusDescription: "turned in", submitDate: moment()}
        API_ASSIGNMENT_STUDENT.POST_UPDATE_FORM(params)
        .then(response => {
            if(response.code === 1){
                this.props.history.push("/assignment/assigned")
            }
        })
    }

    componentDidMount = () => {
        this.POST_CHECK_TOKEN()
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
          if (!err) {
            // console.log('Received values of form: ', values)
            this.POST_UPDATE_FORM(values)
          }
        })
    }

    render() {
        const { getFieldDecorator } = this.props.form
        return(
            <div className="container">
                <Row>
                    <Col span={30}>
                    {
                        (this.props.location.pathname.includes("/assignment/") && this.state.token_status==="admin")?
                        <div>
                        <span className="breadcrumb-admin"><Link style={{ textDecoration: 'none', color: 'rgb(0,0,0,0.65)',padding:'0px 3px' }} to="/admin/process/"> Process </Link> > <Link style={{ textDecoration: 'none', color: 'rgb(0,0,0,0.65)',padding:'0px 3px' }} to="/admin/process/assignment"> Assignment </Link> > ข้อมูลสถานประกอบการในโครงการสหกิจศึกษา มหาวิทยาลัยเกษตรศาสตร์</span><br/>
                        <span className="input-label">Assignment Deadline: </span>
                        <DatePicker className="event-date" onChange={this.onChange} />
                        <span className="input-label">Time: </span>
                        <TimePicker format={format}  onChange={this.onStartDateChange}/> 
                        <Button className="update-deadline-form" onClick={this.updateDeadline}>Save an update</Button>
                        </div>
                       :
                       (this.props.location.pathname.includes("/report/") && this.state.token_status==="admin")?
                       <div>
                        <span className="breadcrumb-admin"><Link style={{ textDecoration: 'none', color: 'rgb(0,0,0,0.65)',padding:'0px 3px' }} to="/admin/process/">Process </Link> > <Link style={{ textDecoration: 'none', color: 'rgb(0,0,0,0.65)',padding:'0px 3px' }} to="/admin/process/report"> Assignment </Link> > ข้อมูลสถานประกอบการในโครงการสหกิจศึกษา มหาวิทยาลัยเกษตรศาสตร์ > {this.props.match.params.idStudent}</span><br/>
                        </div>
                       :<span></span>
                    }
                    <br/>
                    <br/>
                    <span>
                        <center>
                        <b>แบบประเมินผลนิสิตสหกิจศึกษา</b><br/>
                        <span>โครงการนำร่องสหกิจศึกษาของทบวงมหาวิทยาลัย</span>
                        </center>
                    </span>
                    <br/>
                    <hr/>
                    <br/>
                    <span>
                    <b>คำชี้แจง</b><br/>
                    <ol>
                        <li>ผู้ให้ข้อมูลในแบบประเมินนี้ต้องเป็นพนักงานที่ปรึกษา (Job supervisor) ของนิสิตสหกิจศึกษาหรือบุคคลที่ได้รับมอบหมายให้ทำหน้าที่แทน</li>
                        <li>แบบประเมินผลนี้มีทั้งหมด 18 ข้อ โปรดให้ข้อมูลครบทุกข้อ เพื่อความสมบูรณ์ของการประเมินผล</li>
                        <li>โปรดให้คะแนนในช่องในแต่ละหัวข้อการประเมิน หากไม่มีข้อมูลให้ใส่เครื่องหมาย - และโปรดให้ความคิดเห็นเพิ่มเติม (ถ้ามี)</li>
                    </ol>
                    </span>
                    <Form onSubmit={this.handleSubmit}>
                    <span>
                        <Form.Item>
                            <span className="input-label">ชื่อ-นามสกุล</span>
                            {getFieldDecorator('f4_fullName', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก ชื่อ-นามสกุล' }],})( <Input className="event-input" style={{width: '50%'}}  placeholder="" />)}
                            <span className="input-label">รหัสประจำตัว</span>
                            {getFieldDecorator('f4_id', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก รหัสประจำตัว' }],})( <Input className="event-input" style={{width: '26%'}}  placeholder="" />)}
                            <br/>
                            <span className="input-label">สาขาภาควิชา</span>
                            {getFieldDecorator('f4_department', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก สาขาภาควิชา' }],})( <Input className="event-input" style={{width: '40%'}}  placeholder="วิศวกรรมคอมพิวเตอร์" />)}
                            <span className="input-label">คณะ</span>
                            {getFieldDecorator('f4_faculty', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คณะ' }],})( <Input className="event-input" style={{width: '40%'}}  placeholder="วิศวกรรมศาสตร์" />)}
                            <br/>
                            <span className="input-label">ชื่อสถานประกอบการ </span>
                            {getFieldDecorator('f4_companyName', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก ชื่อสถานประกอบการ' }],})( <Input className="event-input" style={{width: '82%'}} placeholder="" />)}
                            <br/>
                            <span className="input-label">ชื่อ-นามสกุลผู้ประเมิน </span>
                            {getFieldDecorator('f5_sup_name', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก ชื่อ-นามสกุลผู้ประเมิน' }],})( <Input className="event-input" style={{width: '82%'}} placeholder="" />)}
                            <br/>
                            <span className="input-label">ตำแหน่ง</span>
                            {getFieldDecorator('f5_sup_position', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก ตำแหน่ง' }],})( <Input className="event-input" style={{width: '30%'}}  placeholder="" />)}
                            <span className="input-label">แผนก</span>
                            {getFieldDecorator('f5_sup_division', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก แผนก' }],})( <Input className="event-input" style={{width: '30%'}}  placeholder="" />)}
                        </Form.Item>
                    </span><br/>

                    <span><b>ผลสำเร็จของงาน (Work Achievement)</b></span><br/><br/>
                    <div className="border-form-5">
                        <span>
                            <div className="border-form-5-title"><b><center>หัวข้อประเมิน/Items</center></b></div>
                            <Form.Item>
                                {/* 1 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>1. ปริมาณงาน (Quantity of work)</b></span><br/><br/>
                                        <span className="tab">
                                            ปริมาณงานที่ปฏิบัติสำเร็จตามหน้าที่หรือตามที่ได้รับมอบหมายภายในระยะเวลาที่กำหนด (ในระดับที่นิสิตจะปฏิบัติได้) และเทียบกับนิสิตทั่ว ๆ ไป
                                        </span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_1', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                                {/* 2 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>2. คุณภาพงาน (Quality of work)</b></span><br/><br/>
                                        <span className="tab">
                                        ทำงานได้ถูกต้องครบถ้วนสมบูรณ์ มีความปราณีตเรียบร้อย มีความรอบคอบ ไม่เกิดปัญหาติดตามมา งานไม่ค้างคา ทำงานเสร็จทันเวลาหรือก่อนเวลาที่กำหนด
                                        </span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_2', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                                </Form.Item>
                        </span>
                    </div><br/><br/>

                    <span><b>ความรู้ความสามารถ (Knowledge and Ablility)</b></span><br/><br/>
                    <div className="border-form-5">
                        <span>
                            <div className="border-form-5-title"><b><center>หัวข้อประเมิน/Items</center></b></div>
                            <Form.Item>
                                {/* 3 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>3. ความรู้ความสามารถทางวิชาการ (Academic ability)</b></span><br/><br/>
                                        <span className="tab">
                                        นิสิตมีความรู้ทางวิชาการเพียงพอ ที่จะทำงานตามที่ได้รับมอบหมาย (ในระดับที่นิสิตจะปฏิบัติได้)
                                        </span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_3', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                                {/* 4 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>4. ความสามารถในการเรียนรู้และประยุกต์วิชาการ (Ability to learn and apply knowledge)</b></span><br/><br/>
                                        <span className="tab">
                                        ความรวดเร็วในการเรียนรู้ เข้าใจข้อมูล ข่าวสาร และวิธีการทำงาน ตลอดจนการนำความรู้ไปประยุกต์ใช้งาน
                                        </span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_4', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                                {/* 5 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>5. ความรู้ความชำนาญด้านปฏิบัติการ (Practical ability)</b></span><br/><br/>
                                        <span className="tab">
                                        เช่น การปฏิบัติงานในภาคสนาม ในห้องปฏิบัติการ 
                                        </span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_5', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                                {/* 6 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>6. วิจารณญาณและการตัดสินใจ (Judgement  and  dicision  making)</b></span><br/><br/>
                                        <span className="tab">
                                        ตัดสินใจได้ดี ถูกต้อง รวดเร็ว มีการวิเคราะห์ ข้อมูลและปัญหาต่างๆ อย่างรอบคอบก่อนการตัดสินใจ สามารถแก้ปัญหาเฉพาะหน้า สามารถไว้วางใจให้ตัดสินใจได้ด้วยตนเอง
                                        </span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_6', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                                {/* 7 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>7. การจัดการและวางแผน (Organization and planning)</b></span><br/><br/>
                                        <span className="tab"></span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_7', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                                {/* 8 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>8. ทักษะการสื่อสาร (Communication skills)</b></span><br/><br/>
                                        <span className="tab">
                                        ความสามารถในการติดต่อสื่อสาร การพูด การเขียน และการนำเสนอ (Presentation) สามารถสื่อให้เข้าใจได้ง่าย เรียบร้อย ชัดเจน ถูกต้อง รัดกุม มีลำดับขั้นตอนที่ดี ไม่ก่อให้เกิดความสับสนต่อการทำงาน  รู้จักสอบถาม รู้จักชี้แจงผลการปฏิบัติงานและข้อขัดข้องให้ทราบ
                                        </span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_8', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                                {/* 9 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>9. การพัฒนาด้านภาษาและวัฒนธรรมต่างประเทศ (Foreign language and cultural development)</b></span><br/><br/>
                                        <span className="tab">เช่น ภาษาอังกฤษ การทำงานกับชาวต่างชาติ</span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_9', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                                {/* 10 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>10. ความเหมาะสมต่อตำแหน่งงานที่ได้รับมอบหมาย (Suitability for Job position)</b></span><br/><br/>
                                        <span className="tab">สามารถพัฒนาตนเองให้ปฏิบัติงานตาม Job position และ Job description ที่มอบหมายได้อย่างเหมาะสมหรือตำแหน่งงานนี้เหมาะสมกับนิสิตคนนี้หรือไม่เพียงใด
                                        </span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_10', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                                </Form.Item>
                        </span>
                    </div><br/><br/>

                    <span><b>ความรับผิดชอบต่อหน้าที่ (Responsibility)</b></span><br/><br/>
                    <div className="border-form-5">
                        <span>
                            <div className="border-form-5-title"><b><center>หัวข้อประเมิน/Items</center></b></div>
                            <Form.Item>
                                {/* 11 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>11. ความรับผิดชอบและเป็นผู้ที่ไว้วางใจได้ (Resposibility  and  dependability)</b></span><br/><br/>
                                        <span className="tab">
                                        ดำเนินงานให้สำเร็จลุล่วงโดยคำนึงถึงเป้าหมาย และความสำเร็จของงานเป็นหลัก
                                        ยอมรับผลที่เกิดจากการทำงานอย่างมีเหตุผล สามารถปล่อยให้ทำงาน (กรณีงานประจำ)
                                        ได้โดยไม่ต้องควบคุมมากจนเกินไป ความจำเป็นในการตรวจสอบขั้นตอนและผลงานตลอดเวลา
                                        สามารถไว้วางใจให้รับผิดชอบงานที่มากกว่าเวลาประจำ สามารถไว้วางใจได้แทบทุกสถานการณ์                           
                                    </span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_11', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                                {/* 12 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>12. ความสนใจ อุตสาหะในการทำงาน (Interest in work)</b></span><br/><br/>
                                        <span className="tab">
                                        ความสนใจและความกระตือรือร้นในการทำงาน มีความอุตสาหะ ความพยายาม
                                        ความตั้งใจที่จะทำงานได้สำเร็จ ความมานะบากบั่น ไม่ย่อท้อต่ออุปสรรคและปัญหา</span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_12', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                                {/* 13 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>13. ความสามารถเริ่มต้นทำงานได้ด้วยตนเอง (Initiative or self starter)</b></span><br/><br/>
                                        <span className="tab">เมื่อได้รับคำชี้แนะ สามารถเริ่มทำงานได้เอง โดยไม่ต้องรอคำสั่ง (กรณีงานประจำ) เสนอตัวเข้า
                                        ช่วยงานแทบทุกอย่าง มาขอรับงานใหม่ ๆ ไปทำ ไม่ปล่อยเวลาว่างให้ล่วงเลยไปโดยเปล่าประโยชน์</span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_13', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                                {/* 14 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>14. การตอบสนองต่อการสั่งการ (Response to supervision)</b></span><br/><br/>
                                        <span className="tab">ยินดีรับคำสั่ง คำแนะนำ คำวิจารณ์ ไม่แสดงความอึดอัดใจ เมื่อได้รับคำติเตือนและวิจารณ์ความรวดเร็วในการปฏิบัติตามคำสั่ง การปรับตัวปฏิบัติตามคำแนะนำ ข้อเสนอแนะและวิจารณ์</span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_14', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                            </Form.Item>
                        </span>
                    </div><br/><br/>

                    <span><b>ลักษณะส่วนบุคคล (Personality)</b></span><br/><br/>
                    <div className="border-form-5">
                        <span>
                            <div className="border-form-5-title"><b><center>หัวข้อประเมิน/Items</center></b></div>
                            <Form.Item>
                                {/* 15 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>15. บุคลิกภาพและการวางตัว (Personality)</b></span><br/><br/>
                                        <span className="tab">มีบุคลิกภาพและวางตัวได้เหมาะสม เช่น ทัศนคติ วุฒิภาวะ ความอ่อนน้อมถ่อมตน การแต่งกาย กิริยาวาจา การตรงต่อเวลา และอื่น ๆ</span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_15', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                                {/* 16 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>16. มนุษยสัมพันธ์ (Interpersonal skills)</b></span><br/><br/>
                                        <span className="tab">สามารถร่วมงานกับผู้อื่น การทำงานเป็นทีม สร้างมนุษยสัมพันธ์ได้ดี เป็นที่รักใคร่ชอบพอของผู้ร่วมงาน เป็นผู้ที่ช่วยก่อให้เกิดความร่วมมือประสานงาน</span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_16', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                                {/* 17 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>17. ความมีระเบียบวินัย ปฏิบัติตามวัฒนธรรมขององค์กร (Discipline and adaptability to formal organization)</b></span><br/><br/>
                                        <span className="tab">ความสนใจเรียนรู้ ศึกษา กฎระเบียบ นโยบาย ต่าง ๆ และปฏิบัติตามโดยเต็มใจ
                                        การปฏิบัติตามระเบียบบริหารงานบุคคล (การเข้างาน ลางาน) ปฏิบัติตามกฎการรักษา
                                        ความปลอดภัยในโรงงาน การควบคุมคุณภาพ 5 ส และอื่น ๆ</span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_17', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                                {/* 18 */}
                                <div className="sup-set">
                                    <div className="sup-label-box sup-label">
                                        <span><b>18. คุณธรรมและจริยธรรม (Ethics and morality)</b></span><br/><br/>
                                        <span className="tab">มีความซื่อสัตย์ สุจริต มีจิตใจสะอาด รู้จักเสียสละ ไม่เห็นแก่ตัว เอื้อเฟื้อช่วยเหลือผู้อื่น</span>
                                    </div>
                                    <div className="sup-score-box">
                                        <span><center><b>20 คะแนน</b></center></span>
                                        {getFieldDecorator('f8_18', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก คะแนน' }],})( <Input className="sup-score-input" placeholder="" />)}
                                    </div>
                                </div>
                            </Form.Item>
                        </span>
                    </div><br/><br/>

                    <span><b>โปรดให้ข้อคิดเห็นที่เป็นประโยชน์แก่นิสิต (Please give comments on the student)</b></span><br/><br/>
                    <div className="border-form-5-comments-box">
                    <span>
                        <div className="border-form-5-comments-title"><b><center>จุดเด่นของนิสิต (Strength)</center></b></div>
                        {getFieldDecorator('f8_19', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก จุดเด่นของนิสิต' }],})( <TextArea placeholder="" autosize={{ minRows: 2, maxRows: 6 }} />)}
                        </span>
                    </div>
                    <div className="border-form-5-comments-box none-border-left">
                    <span>
                        <div className="border-form-5-comments-title"><b><center>ข้อควรปรับปรุงของนิสิต (Improvement)</center></b></div>
                        {getFieldDecorator('f8_20', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก ข้อควรปรับปรุงของนิสิต' }],})( <TextArea placeholder="" autosize={{ minRows: 2, maxRows: 6 }} />)}
                    </span>
                    </div><br/><br/>
                    <span><b>หากนิสิตผู้นี้สำเร็จการศึกษาแล้ว ท่านจะรับเข้าทำงานในสถานประกอบการนี้หรือไม่ </b><i>หากมีโอกาสเลือก</i><br/>
                    <b>Once this student graduats, will you be interested to offer him/her a job?</b></span><br/>
                    {getFieldDecorator('radiogroup')(
                        <RadioGroup>
                            <Radio value={1}>รับ (Yes)</Radio>
                            <Radio value={2}>ไม่แน่ใจ (Not sure)</Radio>
                            <Radio value={3}>ไม่รับ (No)</Radio>
                        </RadioGroup>
                        )}
                    <br/><br/>
                    <Form.Item>
                        <span><b>ข้อคิดเห็นเพิ่มเติม (Other comments)</b></span>
                        {getFieldDecorator('f8_21', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก ข้อคิดเห็นเพิ่มเติม' }],})( <TextArea placeholder="" autosize={{ minRows: 2, maxRows: 10 }} />)}
                    </Form.Item>
                    <br/><br/>

                    <div align="right">
                        {getFieldDecorator('f8_sup_sign', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก ชื่อพนักงานที่ปรึกษา' }],})( <Input className="event-input" style={{width: '15%'}}  placeholder="ชื่อ-นามสกุล" />)}
                        <br/>
                        {getFieldDecorator('f8_sup_position', {valuePropName:this.state.readonly, rule: [{ required: true, message: 'กรุณากรอก ตำแหน่งพนักงานที่ปรึกษา' }],})( <Input className="event-input" style={{width: '15%'}}  placeholder="ตำแหน่ง" />)}
                        <br/>
                        <span className="input-label align-right-signature">พนักงานที่ปรึกษา</span>
                    </div>
                    <br/><br/>

                    <span><b>หมายเหตุ : หากโครงการฯ ไม่ได้รับแบบประเมินนี้ภายในระยะเวลาที่กำหนด นิสิตจะไม่ผ่านการประเมินผล</b></span>

                    <div className="border-form-5-staff">
                        <span>
                        <center><b><u>สำหรับเจ้าหน้าที่สหกิจศึกษา (Co-op staff only)</u></b></center><br/>
                        <ul>
                            <li>คะแนนรวม ข้อ 1-2	 =   _____+1 = _____   คะแนน </li>
                            <li>คะแนนรวม ข้อ 3-10	 =   _____+4 = _____   คะแนน </li>
                            <li>คะแนนรวม ข้อ 11-14	 =   _____+2 = _____   คะแนน </li>
                            <li>คะแนนรวม ข้อ 15-18	 =   _____+2 = _____   คะแนน </li>
                        </ul>
                        <b>รวม = ____ /100 คะแนน</b>
                        </span>
                    </div><br/><br/>
                    {
                        this.props.match.params.supervisor === "supervisor"?
                        <Form.Item>
                        <center>
                            <Button htmlType="submit">ยืนยันข้อมูล</Button><br/>
                            {/* <span>หมายเหตุ: ข้อมูลไม่สามารถแก้ภายหลังได้ กรุณาตรวจสอบข้อมูลก่อนยืนยันข้อมูล</span> */}
                        </center>
                        </Form.Item>:<div></div>
                    }
                    </Form>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default Form.create({ name: 'form_8' })(Form_8)