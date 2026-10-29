'use strict';
/* A 15-slide Nguyễn-dynasty presentation, rebuilt with real licensed imagery.
 * One click = one semantic unit, never one arbitrary text box.
 * The generated PPTX is subsequently patched with native PowerPoint timing.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Educational historical presentation';
pptx.subject = 'Vietnam under the Nguyen dynasty, 1802-1945';
pptx.title = 'VIỆT NAM THỜI NHÀ NGUYỄN | 1802–1945';
pptx.lang = 'vi-VN';
pptx.theme = {
  headFontFace: 'Noto Serif', bodyFontFace: 'Noto Sans', lang: 'vi-VN'
};
const W = 13.333333, H = 7.5;
const C = {
  ink:'071B26', marine:'102D38', deep:'0A2430', panel:'153540',
  panel2:'1C414A', gold:'D6B273', goldSoft:'ECD9AB', ivory:'F5EDDA',
  gray:'B6C6C6', muted:'8FA4AB', teal:'5A9E99', rust:'B46C55',
  line:'35525A', dark:'05141D', white:'FFFFFF'
};
const IMAGE_DIR = path.join(__dirname, 'assets');
const CACHE = path.join(__dirname, 'out', '_image_cache');
const OUTPUT = path.join(__dirname,'out');
fs.mkdirSync(CACHE,{recursive:true});
const manifest = JSON.parse(fs.readFileSync(path.join(IMAGE_DIR,'credits.json'),'utf8')).assets;
const imageFiles = {};
for (const [k,v] of Object.entries(manifest)) imageFiles[k] = path.join(IMAGE_DIR,v.path);
const imageCache = new Map();
function nm(group, piece){return group ? 'CLICK_' + group + '_' + piece : 'STATIC_' + piece;}
function box(s,x,y,w,h,color,opts={}) {
  s.addShape(opts.round ? pptx.ShapeType.roundRect : pptx.ShapeType.rect,{
    x,y,w,h,rectRadius:0.08,
    line:opts.line ? {color:opts.line,transparency:opts.lt||0,width:opts.lw||0.7}:{color:color,transparency:100},
    fill:{color:color,transparency:opts.opacity||0},
    radius:opts.round?0.09:undefined,
    objectName:opts.name||'',
  });
}
function line(s,x1,y1,x2,y2,color=C.gold,width=1,opacity=0){
  s.addShape(pptx.ShapeType.line,{x:x1,y:y1,w:x2-x1,h:y2-y1,
    line:{color,width,transparency:opacity}});
}
function txt(s,text,x,y,w,h,size=18,color=C.ivory,opts={}) {
  s.addText(text,{
    x,y,w,h,
    fontFace:opts.serif?'Noto Serif':'Noto Sans',
    fontSize:size,color,bold:!!opts.bold,breakLine:false,
    margin:0,vertAlign:opts.valign||'mid',align:opts.align||'left',
    italic:!!opts.italic,fit:'shrink',charSpacing:opts.spacing||0,
    lineSpacingMultiple:1.08,
    objectName:opts.name||''
  });
}
function smallLabel(s,value,x,y,w,opts={}) {
  txt(s,value.toUpperCase(),x,y,w,0.23,10.3,C.gold,{bold:true,spacing:1.4,name:opts.name});
}
function frame(s,x,y,w,h,opts={}){
  box(s,x,y,w,h,C.panel,{round:true,line:opts.line||C.line,name:opts.name});
}
function section(s,n,eyebrow,title,subtitle){
  s.background = {color:C.ink};
  box(s,0,0,W,0.065,C.gold);
  smallLabel(s,String(n-1).padStart(2,'0')+' / '+eyebrow,0.72,0.31,11.8);
  txt(s,title,0.72,0.81,11.9,0.65,30,C.ivory,{serif:true,bold:true});
  if(subtitle) txt(s,subtitle,0.74,1.56,11.85,0.42,14.3,C.gray);
  line(s,0.72,7.04,12.6,7.04,C.line,0.65);
  txt(s,'VIỆT NAM THỜI NHÀ NGUYỄN   /   1802–1945',0.75,7.1,9.8,0.16,9,C.muted,{bold:true,spacing:1});
  txt(s,String(n).padStart(2,'0'),12.09,7.095,0.48,0.18,9.5,C.gold,{align:'right',bold:true});
}
async function image(s,key,x,y,w,h,opts={}) {
  if(!imageFiles[key]) return false;
  const variant = key+'-'+Math.round(w*220)+'x'+Math.round(h*220)+'.jpg';
  const dest = path.join(CACHE,variant);
  if(!imageCache.has(variant)){
    if(!fs.existsSync(dest)){
      await sharp(imageFiles[key]).rotate().resize(Math.max(40,Math.round(w*220)),
        Math.max(40,Math.round(h*220)),{fit:'cover',position:opts.position||'attention'})
        .jpeg({quality:88,mozjpeg:true}).toFile(dest);
    }
    imageCache.set(variant,dest);
  }
  s.addImage({path:dest,x,y,w,h,objectName:opts.name||'',altText:opts.alt||''});
  return true;
}
function creditText(ids){
  const lines=[];
  for(const id of [...new Set(ids)]){
    const m=manifest[id];
    if(m) lines.push('- '+m.subject+' | '+m.author+' | '+m.license+' | '+m.source);
  }
  return lines.join('\n');
}
function notes(s,body,ids=[],clicks=[]){
  const cue=clicks.length?clicks.map((v,i)=>'Click '+(i+1)+': '+v).join('\n'):
    'Các nội dung chính hiển thị ngay; click tiếp để chuyển slide.';
  s.addNotes(body+'\n\n[Presenter cues]\n'+cue+'\n\n[Sources]\n'+
    creditText(ids)+'\n- https://whc.unesco.org/en/list/678\n'+
    '- https://heritage.bnf.fr/france-vietnam/vi/cac-trieu-dai-va-chinh-quyen-0\n[/Sources]');
}
function ribbon(s,value,x,y,w,group){
  box(s,x,y,w,0.37,C.gold,{round:true,name:nm(group,'ribbon')});
  txt(s,value,x+0.13,y+0.02,w-0.26,0.32,11.3,C.ink,
      {bold:true,name:nm(group,'ribbontext')});
}
function card(s,x,y,w,h,n,title,body,group){
  frame(s,x,y,w,h,{name:nm(group,'background')});
  smallLabel(s,n,x+0.21,y+0.25,w-0.42,{name:nm(group,'index')});
  line(s,x+0.21,y+0.7,x+w-0.21,y+0.7,C.gold,0.8,45);
  if(h < 2) {
    txt(s,title,x+0.21,y+0.43,w-0.42,0.34,16,C.ivory,
      {bold:true,name:nm(group,'title')});
    txt(s,body,x+0.21,y+0.85,w-0.42,0.38,12,C.gray,
      {name:nm(group,'body')});
  } else {
    txt(s,title,x+0.21,y+0.91,w-0.42,0.5,17,C.ivory,
      {bold:true,name:nm(group,'title')});
    txt(s,body,x+0.22,y+1.53,w-0.44,h-1.78,12.8,C.gray,
      {name:nm(group,'body')});
  }
}
function blockRow(s,x,y,w,number,title,desc,group){
  frame(s,x,y,w,0.99,{name:nm(group,'bg')});
  txt(s,number,x+0.19,y+0.2,0.63,0.49,19,C.gold,{bold:true,name:nm(group,'num')});
  txt(s,title,x+0.82,y+0.12,w-1.04,0.35,15.3,C.ivory,{bold:true,name:nm(group,'title')});
  txt(s,desc,x+0.82,y+0.52,w-1.05,0.31,10.5,C.gray,{name:nm(group,'desc')});
}
function triplet(s,entries,y){
  for(let i=0;i<entries.length;i++){
    const a=entries[i],g=i?('G'+i):null;
    card(s,0.78+i*4.17,y,3.87,3.08,a[0],a[1],a[2],g);
  }
}
async function make(){
  // 01. Cover
  {
    let s=pptx.addSlide();s.background={color:C.ink};
    await image(s,'ngo_mon',0,0,W,H,{alt:'Cổng Ngọ Môn, hiện trạng di tích'});
    box(s,0,0,W,H,C.dark,{opacity:43});
    box(s,0,0,6.8,H,C.ink,{opacity:15});
    box(s,0.83,1.12,0.12,4.6,C.gold);
    smallLabel(s,'LỊCH SỬ VIỆT NAM / CHUYÊN ĐỀ',1.25,1.26,4.8);
    txt(s,'VIỆT NAM',1.22,2.08,5.7,0.72,38,C.ivory,{serif:true,bold:true});
    txt(s,'THỜI NHÀ',1.22,2.88,5.7,0.72,38,C.ivory,{serif:true,bold:true});
    txt(s,'NGUYỄN',1.18,3.67,5.96,1.05,56,C.gold,{serif:true,bold:true});
    txt(s,'1802  —  1945',1.24,5.10,5.3,0.52,23,C.ivory,{bold:true});
    txt(s,'13 vị hoàng đế   ·   143 năm lịch sử',1.26,5.75,5.7,0.38,14,C.gray);
    smallLabel(s,'THỐNG NHẤT  /  BIẾN ĐỘNG  /  DI SẢN',1.24,6.84,8.3);
    notes(s,'Mở đầu bài thuyết trình: Nhà Nguyễn là triều đại quân chủ cuối cùng của Việt Nam, tồn tại từ năm 1802 đến 1945, kinh đô tại Huế. Ảnh cho thấy di tích ở hiện tại, không phải ảnh chụp từ thế kỷ XIX.',['ngo_mon']);
  }
  // 02. Roadmap. The first card shows before any click.
  {
    let s=pptx.addSlide();
    section(s,2,'Toàn cảnh','Một vương triều, ba chương lịch sử',
            'Ba giai đoạn giúp theo dõi một tiến trình dài 143 năm.');
    const entries=[
      ['01  /  1802–1858','XÂY DỰNG','Thống nhất chính trị, đặt kinh đô ở Huế, củng cố triều đình.'],
      ['02  /  1858–1884','BIẾN ĐỘNG','Chiến tranh xâm lược và các điều ước làm suy giảm chủ quyền.'],
      ['03  /  1884–1945','CHUYỂN GIAO','Triều đình tồn tại dưới quyền bảo hộ trước khi thoái vị năm 1945.']
    ];
    for(let i=0;i<3;i++){
      const [label,title,body]=entries[i],x=0.78+i*4.17,g=i?'G'+i:null;
      frame(s,x,2.46,3.87,3.81,{name:nm(g,'panel')});
      if(i===0) await image(s,'gia_long',x+0.16,2.59,3.56,1.25,
        {alt:'Chân dung vua Gia Long',name:'!!gia_long'});
      else if(i===1) await image(s,'ngo_mon',x+0.16,2.59,3.56,1.25,
        {alt:'Di tích Cố đô Huế',name:nm(g,'image')});
      else await image(s,'bao_dai',x+0.16,2.59,3.56,1.25,
        {alt:'Chân dung Bảo Đại',name:nm(g,'image')});
      smallLabel(s,label,x+0.19,4.03,3.44,{name:nm(g,'period')});
      txt(s,title,x+0.19,4.51,3.44,0.4,19,C.ivory,{bold:true,name:nm(g,'title')});
      txt(s,body,x+0.19,5.16,3.45,0.76,13,C.gray,{name:nm(g,'body')});
    }
    ribbon(s,'1802    →    1858    →    1884    →    1945',3.57,6.55,6.1,'G3');
    notes(s,'Giới thiệu ba thời kỳ. 1858 là mốc Pháp và Tây Ban Nha tấn công Đà Nẵng, không phải thời điểm Việt Nam đã hoàn toàn trở thành nước bảo hộ.',['gia_long','ngo_mon','bao_dai'],
       ['Hiện card giai đoạn 1858–1884.','Hiện card giai đoạn 1884–1945.','Hiện trục thời gian tổng kết.']);
  }
  // 03. Gia Long
  {
    let s=pptx.addSlide();
    section(s,3,'Khởi đầu','Gia Long và sự ra đời triều Nguyễn','');
    frame(s,0.78,1.72,5.3,5.05);
    await image(s,'gia_long',0.91,1.84,5.04,4.38,{name:'!!gia_long',alt:'Tranh chân dung vua Gia Long'});
    smallLabel(s,'CHÂN DUNG VẼ / TƯ LIỆU LỊCH SỬ',1.05,6.42,4.85);
    txt(s,'1802',7.06,1.94,5.2,1.12,73,C.gold,{serif:true,bold:true});
    smallLabel(s,'THỐNG NHẤT ĐẤT NƯỚC',7.08,3.37,5.0);
    txt(s,'Nguyễn Phúc Ánh lên ngôi, lấy niên hiệu Gia Long, mở đầu triều Nguyễn.',7.06,3.88,5.05,1.38,21,C.ivory,{serif:true});
    frame(s,7.03,5.65,5.15,0.89);
    txt(s,'Từ Phú Xuân (Huế), nhà Nguyễn xây dựng bộ máy quản lý đất nước.',7.24,5.81,4.75,0.55,13,C.gray);
    notes(s,'Năm 1802, Nguyễn Ánh đánh bại nhà Tây Sơn và lên ngôi với niên hiệu Gia Long. Chính trị quy về triều đình tại Phú Xuân. Chân dung là tranh, không phải ảnh chụp.',['gia_long']);
  }
  // 04. Imperial capital
  {
    let s=pptx.addSlide();
    section(s,4,'Trung tâm quyền lực','Kinh đô Huế',
      'Không gian chính trị, nghi lễ và văn hóa của triều Nguyễn.');
    await image(s,'hue_citadel',6.57,1.97,5.99,4.92,
      {alt:'Đại Nội Huế ngày nay'});
    box(s,6.57,6.39,5.99,0.5,C.deep,{opacity:8});
    txt(s,'Ảnh di tích Huế ngày nay',6.8,6.48,5.52,0.25,11,C.ivory);
    blockRow(s,0.82,2.22,5.3,'01','KINH THÀNH','Vành đai phòng thủ và không gian đô thị hoàng gia.',null);
    blockRow(s,0.82,3.47,5.3,'02','HOÀNG THÀNH','Nơi bố trí các cơ quan và công trình nghi lễ.','G1');
    blockRow(s,0.82,4.72,5.3,'03','TỬ CẤM THÀNH','Không gian sinh hoạt đặc biệt của hoàng gia.','G2');
    notes(s,'Huế là trung tâm quyền lực của triều Nguyễn trong giai đoạn 1802–1945. Kinh thành, Hoàng thành và Tử Cấm thành tạo thành những lớp không gian có chức năng khác nhau. UNESCO ghi danh Quần thể di tích Cố đô Huế năm 1993.',['hue_citadel'],['Hiện phần Hoàng thành.','Hiện phần Tử Cấm thành.']);
  }
  // 05. Political organization
  {
    let s=pptx.addSlide();
    section(s,5,'Bộ máy nhà nước','Từ triều đình đến địa phương',
      'Cải cách Minh Mạng củng cố cơ chế quản trị tập trung.');
    frame(s,0.79,2.05,3.05,4.46);
    txt(s,'1831',1.03,2.55,2.54,0.97,57,C.gold,{serif:true,bold:true});
    txt(s,'– 1832',1.05,3.52,2.5,0.69,34,C.ivory,{serif:true,bold:true});
    txt(s,'Đợt cải cách hành chính quan trọng thời Minh Mạng.',1.08,4.67,2.39,1.04,16,C.gray);
    frame(s,4.26,2.07,8.24,0.69);
    txt(s,'HOÀNG ĐẾ   /   TRIỀU ĐÌNH TRUNG ƯƠNG',4.48,2.26,7.8,0.3,18,C.ivory,
      {align:'center',bold:true});
    ribbon(s,'LỤC BỘ',7.16,3.06,2.3,'G1');
    const ministries=['LẠI','HỘ','LỄ','BINH','HÌNH','CÔNG'];
    for(let i=0;i<6;i++){
      const x=4.28+(i%3)*2.76,y=3.65+Math.floor(i/3)*0.83;
      frame(s,x,y,2.55,0.61,{name:nm('G1','ministry'+i+'bg')});
      txt(s,ministries[i],x+0.12,y+0.13,2.31,0.32,15,C.ivory,
        {bold:true,align:'center',name:nm('G1','ministry'+i+'text')});
    }
    frame(s,4.29,5.66,8.21,0.73,{name:nm('G2','provinceBg')});
    txt(s,'30 TỈNH   +   PHỦ THỪA THIÊN',4.58,5.88,7.64,0.29,18,C.gold,
      {bold:true,align:'center',name:nm('G2','provinceText')});
    smallLabel(s,'SƠ ĐỒ LƯỢC GIẢN CÁC THIẾT CHẾ',5.16,6.68,6.65);
    notes(s,'Vua là trung tâm. Lục bộ phụ trách các mảng quản trị. Trong các năm 1831–1832, Minh Mạng sắp xếp lại địa phương thành 30 tỉnh và phủ Thừa Thiên. Sơ đồ khái quát không thể hiện mọi chức quan.',['minh_mang'],
      ['Hiện đồng thời sáu bộ trong Lục bộ.','Hiện cơ cấu 30 tỉnh và phủ Thừa Thiên.']);
  }
  // 06. Economy
  {
    let s=pptx.addSlide();
    section(s,6,'Đời sống xã hội','Nhịp sống dưới triều Nguyễn',
       'Nông nghiệp giữ vai trò nền tảng, cùng với nghề thủ công và hoạt động trao đổi.');
    triplet(s,[
      ['01 / NỀN TẢNG','NÔNG NGHIỆP','Lúa nước, công trình thủy lợi và cấu trúc làng xã là trụ cột kinh tế.'],
      ['02 / KỸ NGHỆ','THỦ CÔNG','Nghề mộc, đúc đồng, dệt, khắc in phục vụ dân gian lẫn cung đình.'],
      ['03 / GIAO LƯU','THƯƠNG MẠI','Các chợ, tuyến sông và cửa biển kết nối nhiều vùng hàng hóa.']
    ],2.77);
    notes(s,'Đời sống cư dân đa dạng nhưng nông nghiệp vẫn là nền tảng. Hoạt động thủ công và thương mại tồn tại với quy mô khác nhau theo giai đoạn, vùng miền. Không nên đồng nhất toàn bộ xã hội với cung đình.',[],
      ['Hiện nhóm nghề thủ công.','Hiện nhóm thương mại.']);
  }
  // 07. Scholar path
  {
    let s=pptx.addSlide();
    section(s,7,'Giáo dục và khoa cử','Học để bước vào bộ máy quan lại','');
    smallLabel(s,'CON ĐƯỜNG KHOA CỬ',0.84,2.11,5.57);
    blockRow(s,0.8,2.62,5.35,'01','HỌC TẬP','Nho học, kinh điển và chữ Hán là nền tảng.',null);
    blockRow(s,0.8,3.87,5.35,'02','THI CỬ','Các kỳ thi Hương, Hội, Đình được tổ chức.','G1');
    blockRow(s,0.8,5.12,5.35,'03','LÀM QUAN','Người đỗ đạt có thể tham gia bộ máy hành chính.','G2');
    frame(s,6.57,1.93,5.94,4.84);
    await image(s,'woodblocks',6.7,2.08,5.68,4.22,{alt:'Mộc bản triều Nguyễn'});
    smallLabel(s,'MỘC BẢN / DI SẢN TƯ LIỆU',6.91,6.44,5.2);
    notes(s,'Nho học giữ vị trí chủ đạo trong giáo dục chính thống, các kỳ thi lựa chọn nhân sự cho hệ thống quan lại. Mộc bản triều Nguyễn là tư liệu lịch sử được UNESCO công nhận trong Chương trình Ký ức thế giới.',['woodblocks'],
      ['Hiện bước thi cử.','Hiện bước tuyển dụng làm quan.']);
  }
  // 08. Cultural legacy
  {
    let s=pptx.addSlide();
    section(s,8,'Văn hóa cung đình','Một di sản vượt ra ngoài cung điện',
      'Âm nhạc, tư liệu, mỹ thuật và lễ nghi cùng tạo thành di sản triều Nguyễn.');
    await image(s,'woodblocks',0.75,2.15,5.41,4.55,
      {alt:'Mộc bản triều Nguyễn'});
    card(s,6.54,2.14,5.91,1.4,'01','NHÃ NHẠC','Di sản âm nhạc cung đình Huế.','G1');
    card(s,6.54,3.76,5.91,1.4,'02','MỘC BẢN','Hệ thống ván khắc phục vụ in ấn và ghi chép.','G2');
    card(s,6.54,5.38,5.91,1.4,'03','CHÂU BẢN','Hồ sơ hành chính lưu dấu hoạt động triều đình.','G3');
    notes(s,'Di sản nhà Nguyễn có cả giá trị vật thể và phi vật thể. Nhã nhạc cung đình Huế được UNESCO ghi danh; mộc bản và châu bản giúp phục dựng nhiều hoạt động quản trị và lịch sử xã hội.',['woodblocks'],
      ['Giới thiệu Nhã nhạc.','Giới thiệu Mộc bản.','Giới thiệu Châu bản.']);
  }
  // 09. Architectural heritage
  {
    let s=pptx.addSlide();
    section(s,9,'Kiến trúc và di sản','Huế: một kinh đô được bảo tồn',
      'Quy hoạch, nghi lễ và cảnh quan tạo nên bản sắc cố đô.');
    await image(s,'khai_dinh',0.74,2.01,7.03,4.76,
      {alt:'Lăng Khải Định, ảnh hiện trạng'});
    frame(s,8.1,2.01,4.44,4.8);
    smallLabel(s,'QUẦN THỂ DI TÍCH CỐ ĐÔ HUẾ',8.38,2.4,3.92);
    txt(s,'1993',8.36,2.92,3.88,1.0,54,C.gold,{serif:true,bold:true});
    txt(s,'UNESCO ghi danh Di sản Văn hóa Thế giới',8.39,4.12,3.72,0.65,16,C.ivory,{bold:true});
    line(s,8.38,5.07,12.12,5.07,C.gold,1,30);
    txt(s,'Kinh thành   •   Lăng tẩm   •   Đền miếu',8.39,5.39,3.65,0.84,14,C.gray,
      {name:nm('G1','list')});
    notes(s,'Quần thể di tích Huế đã được UNESCO ghi danh năm 1993. Ảnh là lăng Khải Định trong hiện trạng được ghi hình, không mô tả chính xác thời điểm xây dựng.',['khai_dinh'],
      ['Hiện danh sách thành phần di sản kiến trúc.']);
  }
  // 10. Foreign relations
  {
    let s=pptx.addSlide();
    section(s,10,'Thế giới bên ngoài','Đối ngoại trong thế kỷ XIX',
      'Không thể giản lược toàn bộ chính sách của triều Nguyễn thành “đóng cửa”.');
    txt(s,'GIỮ TRẬT TỰ CŨ,',0.88,2.08,10.9,0.8,35,C.ivory,{serif:true,bold:true});
    txt(s,'ĐỐI MẶT THẾ GIỚI MỚI',0.88,2.91,11.42,0.8,34,C.gold,{serif:true,bold:true});
    const rows=[
      ['01','BANG GIAO','Quan hệ với nhà Thanh và các nước trong khu vực.'],
      ['02','GIAO THƯƠNG','Trao đổi quốc tế tồn tại nhưng chịu quản lý và hạn chế.'],
      ['03','VA CHẠM','Áp lực quân sự, truyền giáo và ngoại giao phương Tây gia tăng.']
    ];
    rows.forEach((v,i)=>blockRow(s,0.89,4.08+i*0.85,11.52,v[0],v[1],v[2],i?'G'+i:null));
    notes(s,'Triều Nguyễn duy trì quan hệ ngoại giao và thương mại, song có những biện pháp kiểm soát chặt chẽ, trong khi tương quan quân sự với phương Tây biến đổi. Cần phân tích chính sách đối ngoại trong bối cảnh chủ nghĩa thực dân thế kỷ XIX.',[],
      ['Hiện nội dung giao thương.','Hiện nội dung va chạm với phương Tây.']);
  }
  // 11. War, don't use unrelated landscape as "war photograph"
  {
    let s=pptx.addSlide();
    section(s,11,'Biến động quân sự','1858: cuộc xâm lược bắt đầu','');
    frame(s,0.83,1.93,5.42,4.82);
    txt(s,'1858',1.07,2.32,4.83,1.22,65,C.gold,{serif:true,bold:true});
    txt(s,'ĐÀ NẴNG',1.09,3.76,4.82,0.65,28,C.ivory,{bold:true});
    txt(s,'Liên quân Pháp và Tây Ban Nha tấn công Đà Nẵng, mở đầu chiến tranh xâm lược.',1.12,4.7,4.77,1.18,17,C.gray);
    frame(s,6.63,1.93,5.84,4.82);
    await image(s,'hue_citadel',6.78,2.08,5.54,3.3,
      {alt:'Huế ngày nay, không phải ảnh chiến sự'});
    txt(s,'Ảnh di tích Huế ngày nay, không phải ảnh chiến sự năm 1858.',6.84,5.61,5.44,0.62,13,C.gray,
      {name:nm('G1','caption')});
    notes(s,'Năm 1858, liên quân Pháp và Tây Ban Nha tấn công Đà Nẵng. Chiến sự kéo dài và mở rộng vào Nam Kỳ rồi Bắc Kỳ trong các thập niên sau. Không dùng ảnh di tích Huế làm bằng chứng trực quan cho trận đánh Đà Nẵng.',['hue_citadel'],
      ['Nêu rõ ảnh bên phải chỉ là ảnh di tích ngày nay, không phải tư liệu trận đánh.']);
  }
  // 12. Treaties
  {
    let s=pptx.addSlide();
    section(s,12,'Bước ngoặt chủ quyền','Những hòa ước năm 1883–1884','');
    frame(s,0.83,2.17,5.72,3.66);
    txt(s,'1883',1.15,2.52,5.04,0.89,48,C.gold,{serif:true,bold:true});
    txt(s,'HÒA ƯỚC HARMAND',1.14,3.59,5.05,0.55,21,C.ivory,{bold:true});
    txt(s,'Những điều khoản nghiêm ngặt làm suy giảm quyền tự chủ của triều đình.',1.15,4.49,5.05,0.77,16,C.gray);
    frame(s,6.8,2.17,5.72,3.66,{name:nm('G1','bg')});
    txt(s,'1884',7.12,2.52,5.04,0.89,48,C.gold,{serif:true,bold:true,name:nm('G1','year')});
    txt(s,'HÒA ƯỚC PATENÔTRE',7.12,3.59,5.07,0.55,21,C.ivory,
      {bold:true,name:nm('G1','title')});
    txt(s,'Củng cố khuôn khổ bảo hộ Pháp đối với triều đình Huế.',7.13,4.49,5.04,0.77,16,C.gray,
      {name:nm('G1','desc')});
    ribbon(s,'NAM KỲ: THUỘC ĐỊA     •     BẮC & TRUNG KỲ: BẢO HỘ',2.07,6.25,9.15,'G2');
    notes(s,'Hòa ước Harmand năm 1883 và Patenôtre năm 1884 gắn liền với việc áp đặt chế độ bảo hộ của Pháp. Cần phân biệt Nam Kỳ thuộc địa với Bắc Kỳ và Trung Kỳ dưới chế độ bảo hộ.',['bao_dai'],
      ['Giới thiệu Hòa ước Patenôtre 1884.','Tổng kết quy chế thuộc địa và bảo hộ.']);
  }
  // 13. Resistance
  {
    let s=pptx.addSlide();
    section(s,13,'Kháng chiến cuối thế kỷ XIX','Phong trào Cần Vương',
      'Lời kêu gọi chống Pháp lan rộng trong giới sĩ phu và nghĩa quân.');
    txt(s,'1885',0.93,2.18,6.3,1.1,69,C.gold,{serif:true,bold:true});
    txt(s,'CHIẾU CẦN VƯƠNG',0.98,3.56,6.28,0.5,23,C.ivory,{bold:true});
    txt(s,'Vua Hàm Nghi và Tôn Thất Thuyết kêu gọi kháng chiến chống Pháp.',0.98,4.27,6.24,1.13,19,C.gray);
    frame(s,7.65,2.15,4.64,3.93);
    smallLabel(s,'13.07.1885',7.96,2.55,3.87);
    txt(s,'TÂN SỞ',7.96,3.19,3.85,0.8,30,C.gold,{bold:true});
    txt(s,'SĨ PHU  •  NGHĨA QUÂN',7.95,4.27,3.85,0.69,16,C.ivory,
      {name:nm('G1','forces')});
    notes(s,'Sau biến cố kinh thành Huế tháng 7/1885, vua Hàm Nghi và Tôn Thất Thuyết ra Tân Sở. Chiếu Cần Vương ngày 13/7/1885 đã thúc đẩy nhiều cuộc kháng chiến chống Pháp.',['hue_citadel'],['Hiện địa điểm, thời điểm và lực lượng hưởng ứng.']);
  }
  // 14. 1945
  {
    let s=pptx.addSlide();
    section(s,14,'Chuyển giao thời đại','1945: khép lại một vương triều','');
    txt(s,'1945',0.86,1.96,5.52,1.12,72,C.gold,{serif:true,bold:true});
    smallLabel(s,'30 THÁNG 8 / HUẾ',0.94,3.31,5.32);
    txt(s,'Bảo Đại thoái vị. Triều Nguyễn kết thúc sau 143 năm, khép lại chế độ quân chủ tại Việt Nam.',0.94,3.88,5.24,1.3,19,C.ivory,{serif:true});
    frame(s,0.88,5.68,5.31,0.93,{name:nm('G1','legacyPanel')});
    txt(s,'Di sản văn hóa còn lại, dù một thể chế chính trị đã kết thúc.',1.07,5.85,4.95,0.54,13,C.gray,
      {name:nm('G1','legacyText')});
    await image(s,'bao_dai',6.57,1.92,3.45,4.91,{alt:'Chân dung Bảo Đại'});
    await image(s,'ngo_mon',10.19,1.92,2.26,4.91,{alt:'Cổng Ngọ Môn',name:'!!hue-last'});
    notes(s,'Bảo Đại làm lễ thoái vị tại Huế ngày 30/8/1945. Đây là dấu mốc kết thúc chế độ quân chủ. Chân dung Bảo Đại là tư liệu ảnh lịch sử; ảnh Ngọ Môn là ảnh di tích hiện trạng.',['bao_dai','ngo_mon'],['Đánh giá di sản còn lại sau sự kết thúc thể chế.']);
  }
  // 15. Close
  {
    let s=pptx.addSlide();s.background={color:C.ink};
    box(s,0,0,W,0.065,C.gold);
    await image(s,'ngo_mon',6.75,0.45,6.0,6.31,{alt:'Cổng Ngọ Môn',name:'!!hue-last'});
    box(s,6.75,0.45,6.0,6.31,C.dark,{opacity:66});
    smallLabel(s,'KẾT THÚC BÀI THUYẾT TRÌNH',0.83,1.05,5.8);
    txt(s,'XIN CHÂN THÀNH',0.83,1.87,6.7,0.7,29,C.ivory,{serif:true,bold:true});
    txt(s,'CẢM ƠN',0.8,2.67,6.3,1.08,51,C.gold,{serif:true,bold:true});
    txt(s,'Cảm ơn thầy cô và các bạn đã dành thời gian lắng nghe.',0.9,4.33,5.34,0.84,17,C.ivory);
    txt(s,'Rất mong nhận được câu hỏi và những ý kiến trao đổi.',0.9,5.33,5.44,0.78,15,C.gray);
    smallLabel(s,'HỎI & ĐÁP  /  THẢO LUẬN',0.88,6.63,5.8);
    notes(s,'Lời kết: Qua 143 năm, triều Nguyễn để lại một di sản phong phú và phức tạp. Cảm ơn người nghe, mời đặt câu hỏi. Ảnh Ngọ Môn là ảnh chụp di tích hiện tại.',['ngo_mon']);
  }
  const outfile=path.join(OUTPUT,'Viet_Nam_Thoi_Nha_Nguyen_15_Slides_REAL_PHOTOS_base.pptx');
  await pptx.writeFile({fileName:outfile});
  console.log('PPTX written:',outfile);
}
make().catch(e=>{console.error(e);process.exit(1)});
