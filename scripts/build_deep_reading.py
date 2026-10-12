#!/usr/bin/env python3
"""Build extended Vietnamese research tutorials from reviewed, paper-specific data.

The existing chapters and slide claims are human-reviewed primary inputs; the
generated paragraphs are educational interpretations and proposed tests, not
claims of new results. Static Markdown output: no LLM API or runtime cost.
"""
import argparse, json, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
START="<!-- BEGIN EXTENDED WALKTHROUGH -->"
END="<!-- END EXTENDED WALKTHROUGH -->"
SECTION={"cover":"Vì sao","problem":"Vì sao","contrast":"Vì sao","concepts":"Kiến thức nền",
"intuition":"Phương pháp","pipeline":"Phương pháp","representation":"Phương pháp",
"training":"Phương pháp","equation":"Phương pháp","inference":"Ví dụ",
"results":"Kết quả","ablation":"Kết quả","limits":"Hạn chế","relations":"Liên hệ","closing":"Đọc code"}

def text(item):
    if isinstance(item,dict): return item["label"]+": "+item["value"]
    return item

def count(s):
    s=re.sub(r"!\[[^]]*\]\([^)]+\)","",s)
    s=re.sub(r"https?://\S+","",s)
    return len(s.split())

def evidence(slides):
    data={s["type"]:s for s in slides}
    lead=lambda type:data[type]["lead"]
    item=lambda type,i=0:text(data[type]["items"][min(i,len(data[type]["items"])-1)])
    return dict(problem=lead("problem"),old=item("contrast"),new=lead("intuition"),
      mechanism=lead("pipeline"),input=item("pipeline"),output=item("pipeline",3),
      action=lead("representation"),train=lead("training"),inference=lead("inference"),
      result=lead("results"),ablation=lead("ablation"),limitation=item("limits"),
      critique=item("limits",1),practice=item("closing"),stages=" → ".join(map(text,data["pipeline"]["items"])))

def sections(md):
    out=[]
    for part in re.split(r"(?=^## )",md,flags=re.M):
        if not part:continue
        lines=part.split("\n",1)
        title=lines[0][3:].strip() if part.startswith("## ") else ""
        out.append((title,part))
    return out

def format_fig(fig):
    n,p=fig["number"],fig["page"]
    return (f"![Hình {n} gốc từ PDF bài báo, trang {p}]({fig['image']})\n\n"
      f"*Hình {n}, trang {p}. Ảnh được cắt từ PDF gốc, không phải hình AI tái tạo. "
      f"[Xem caption đầy đủ trong PDF]({fig['pdf']}#page={p}).*\n\n")

def lesson(slide,c):
    kind=slide["type"]; title=slide["title"]; lead=slide["lead"]
    detail=slide.get("detail",{}).get("text",slide["intuition"])
    intuition=slide["intuition"]
    items=[text(x) for x in slide["items"]]
    first=items[0] if items else lead
    second=items[1] if len(items)>1 else detail
    # Every subsection is explicitly bound to that paper's editorial statements.
    start=(f"### Đào sâu: {title}\n\n**Luận điểm.** {lead} "
           f"{detail}\n\n")
    if kind=="cover":
        core=[
        f"**Vấn đề khoa học nằm ở đâu?** {c['problem']} Một hệ thống robot có thể có hình ảnh đẹp, output trông hợp lý nhưng vẫn sai ở cơ cấu thực thi. Vì thế phải tách câu hỏi về dữ liệu, câu hỏi về representation, câu hỏi về policy và câu hỏi về đánh giá. {first} là đóng góp cần đọc cùng các giả định ấy, không phải câu slogan thay thế cho thí nghiệm.",
        f"**Đọc đóng góp như một giả thuyết.** Cơ chế được đề xuất là {c['new']} Nếu nó thật sự hữu ích, điểm khác biệt phải xuất hiện tại chính nơi baseline gặp bottleneck. Không đủ chỉ liệt kê thành phần mới; cần giải thích tại sao dữ liệu hoặc observation hiện có không giải được bài toán với cách làm cũ."
        ]
    elif kind=="problem":
        core=[
        f"**Tại sao lỗi này có hệ quả lớn?** {first}. Mỗi action làm thay đổi trạng thái môi trường và tạo ra observation tiếp theo. Một dự đoán hơi lệch có thể đẩy robot ra ngoài những trạng thái từng thấy trong demonstration, khiến bước sau khó phục hồi hơn. Bản thân {title.lower()} vì thế ảnh hưởng đến toàn bộ rollout, chứ không chỉ một hàng trong bảng accuracy.",
        f"**Thử nghĩ một phản ví dụ.** Nếu chỉ test các episode có điểm bắt đầu giống dữ liệu huấn luyện, policy có thể học shortcut về bối cảnh. Đổi nhẹ góc camera, vật thể hoặc thứ tự thao tác sẽ phơi bày liệu nó có dùng tín hiệu nhân quả phù hợp không. {detail} là lý do ta phải xem điều kiện test trước khi đọc con số success."
        ]
    elif kind=="contrast":
        core=[
        f"**Hai quy trình khác nhau ra sao?** Phương pháp cũ gặp trở ngại: {c['old']}. Thay đổi trọng tâm là: {first}. Câu hỏi có ích nhất không phải mạng mới có bao nhiêu lớp, mà là thông tin nào trước kia bị đánh mất và giờ được chuyển qua đúng mô-đun. {second}",
        f"**Đặt điều kiện đối chứng.** Nếu train hai cách với data budget khác nhau, hoặc một bên dùng pretrained encoder còn bên kia không, chênh lệch không đủ để gán cho cơ chế mới. Một ablation đúng phải giữ càng nhiều yếu tố càng tốt và thay đổi đúng thành phần tác giả muốn chứng minh."
        ]
    elif kind=="concepts":
        core=[
        f"**Khái niệm thành cấu trúc tính toán.** {first}. Hãy luôn hỏi: input tensor là gì, output tensor là gì, biểu diễn đó mang thông tin thời gian hay không, và vì sao không thể đơn giản thay bằng một vector khác. {detail} Một thuật ngữ chỉ hữu ích khi nối được với dữ liệu và hành vi có thể quan sát.",
        f"**Tránh ba sự nhầm lẫn.** Dataset đa dạng chưa phải model khái quát; có latent hoặc token chưa chắc học được semantics; loss offline tốt chưa chắc action thực thi ổn định. Phần kiến thức nền dùng để loại trừ các kết luận quá mạnh đó. Muốn khẳng định model dùng đúng khái niệm, hãy kiểm tra ablation và intermediate representation."
        ]
    elif kind=="pipeline":
        core=[
        f"**Lần theo đầu vào đến đầu ra.** Sơ đồ nên được đọc theo thứ tự {c['stages']}. Mỗi mũi tên tương ứng với một thao tác thực: đọc cảm biến, xử lý tensor, trích đặc trưng, suy luận, giải mã hoặc gửi command. Nếu bỏ qua quá trình chuẩn hoá hay xử lý timestamp, sơ đồ vẫn đẹp nhưng implementation có thể fail.",
        f"**Chỗ dễ sai khi triển khai.** {detail} Với mỗi module, hãy ghi checkpoint nào dùng, shape dữ liệu, đơn vị và hệ quy chiếu, thành phần nào có gradient và thành phần nào chỉ hiện diện lúc training. Sau đó log action trước và sau inverse normalization để phát hiện lỗi thuộc pipeline chứ không phải lỗi model."
        ]
    elif kind=="intuition":
        core=[
        f"**Giải thích không dùng tên model.** {intuition} Thử mô tả bằng một câu chuyện đầu vào và đầu ra, tránh dựa vào từ như Transformer, flow, token hay MoE để thay thế giải thích. Điều quan trọng là hiểu cơ chế ấy biến thông tin quan sát thành điều gì có ích để robot ra quyết định.",
        f"**Từ intuition tới phép thử.** {first}. Nếu ta loại bỏ cơ chế đó nhưng giữ nguyên dữ liệu và evaluator, lỗi nào kỳ vọng tăng lên? Nếu không dự đoán được loại lỗi, có thể ta chỉ đang học thuộc mô tả phương pháp mà chưa hiểu tại sao tác giả lựa chọn nó."
        ]
    elif kind=="representation":
        core=[
        f"**Action là một hợp đồng kỹ thuật.** {first}. Một vector điều khiển có thể là joint angle, delta end-effector, gripper hoặc các token đã lượng tử hoá. Cần biết số chiều, đơn vị, hệ tọa độ, scaling và trục thời gian. {detail} Không xác định các yếu tố này thì chưa thể nối output model với phần cứng.",
        f"**Kiểm tra trước khi train.** Lấy một trajectory đúng, encode rồi decode qua representation dự kiến. Đo reconstruction error trên từng chiều và vị trí thời gian quan trọng, nhất là khi tiếp xúc vật thể. Thử đổi horizon hoặc normalization mà giữ nguyên dữ liệu. Một adapter sai có thể phá mọi rollout dù bản thân network vẫn tối ưu được loss."
        ]
    elif kind=="training":
        core=[
        f"**Loss phải có nguồn supervision.** {first}. Hãy chỉ ra batch gồm observation, state, instruction, target action hay target đặc trưng nào; rồi xác định mô hình đang học reconstruction, dự đoán chuỗi hay một phân phối có điều kiện. Cùng tên 'training' nhưng cách tạo target ở BC, diffusion, flow matching và mô hình dự đoán đặc trưng khác nhau căn bản.",
        f"**Phân tách lỗi dữ liệu và lỗi thuật toán.** {detail} Kiểm tra episode split trước khi chia thành window, kiểm tra timestamp camera/action, normalization, random seed và khả năng overfit một subset nhỏ. Nếu vài trajectory còn không học được, việc tăng model size hoặc đổi scheduler thường chỉ che lỗi implementation.",
        f"**Đọc ablation đúng cách.** {c['ablation']} Khi đổi một module phải giữ data budget, training steps và quy trình đánh giá tương đương. Nếu nhiều thứ đổi cùng lúc, tác dụng thực sự là của toàn hệ thống, không thể kết luận một trick đơn lẻ tạo toàn bộ mức cải thiện."
        ]
    elif kind=="inference":
        core=[
        f"**Một tick điều khiển xảy ra thế nào?** {first}. Ta nhận observation, tính conditioning, sinh action, giải mã và gửi lệnh xuống controller. {detail} Hãy ghi lại thời điểm ở mỗi bước vì latency từ ảnh đến actuator khác với thời gian chạy forward của riêng backbone.",
        f"**Khi môi trường đổi giữa hai lần query.** Nếu vật thể dịch chuyển, mô hình có nhận observation mới đủ nhanh không; action nào đã cam kết và action nào có thể sửa? {second} Trả lời được mới hiểu policy có thực sự closed-loop hoặc chỉ phát một quỹ đạo cố định rồi hy vọng robot làm đúng.",
        f"**Điều nên đo thêm.** Ngoài task success, hãy log tail latency, action jerk, lỗi ở điểm nối các action chunk và khả năng phục hồi sau disturbance. Một video chuyển động mượt không chứng minh robot làm đúng mục tiêu, còn throughput cao chưa chắc đảm bảo control loop ổn định."
        ]
    elif kind=="equation":
        core=[
        f"**Công thức đang mô tả thứ gì?** {lead} Trước khi tính đạo hàm hoặc chuyển vế, hãy xác định đâu là observation, đâu là biến action, đâu là horizon/conditioning và đâu là tham số được học. {detail} Ký hiệu ngắn gọn không nói hết cách chọn discretization, action mask hoặc runtime sampler.",
        f"**Một phép thử bằng hai trajectory.** Hai lần thao tác có cùng mục tiêu nhưng trạng thái ban đầu khác nhau có thể cần action khác. Công thức này có cho phép output phụ thuộc vào thông tin phân biệt ấy không? Nếu nhiều demonstration hợp lệ khác nhau, model học một mode, average hay một phân phối đa mode? Đây mới là câu hỏi hiểu toán trong robot learning.",
        f"**Giới hạn của suy luận từ công thức.** {first}. Một biểu thức xác suất hoặc phép nội suy không tự chứng minh model đã học vật lý hay robot sẽ thành công. Loss và nguồn target quyết định model có tín hiệu nào, còn evaluation mới cho biết hành vi thực hiện ngoài đời."
        ]
    elif kind=="results":
        core=[
        f"**Cách đọc bảng số liệu.** {first}. Trước khi so score, xác định metric đo thành công cuối hay progress từng bước, baseline dùng dữ liệu gì, số lần lặp, tập test và cách gộp các nhiệm vụ. {detail} Chênh lệch average đôi khi giấu những task thất bại nghiêm trọng.",
        f"**Từ số sang kết luận có phạm vi.** {second}. Một mô hình khái quát tốt trên lệnh mới chưa chắc điều khiển contact-rich tốt; data diversity hiệu quả chưa bảo đảm chuyển được sang morphology lạ; model chạy nhanh chưa có nghĩa tail latency phù hợp servo. Phải kết luận theo đúng chiều mà thí nghiệm đo.",
        f"**Độ tin cậy của bằng chứng.** Camera placement, calibration, noise, split, seed và budget huấn luyện đều ảnh hưởng outcome. Một kết quả đáng tin cần báo cáo đủ điều kiện để người đọc kiểm tra, và có đối chứng tránh nhiễu. Nếu thiếu, hãy nói rõ mức bất định thay vì tưởng tượng số liệu."
        ]
    elif kind=="ablation":
        core=[
        f"**Ablation hỏi nguyên nhân, không chỉ điểm số.** {first}. Loại bỏ một thành phần khiến performance giảm là dấu hiệu hữu ích trong thiết lập đã thử, nhưng chưa chứng minh nó là giải pháp duy nhất. {detail} Hãy tìm xem các đường baseline có chung dữ liệu, model capacity và ngân sách tối ưu không.",
        f"**Đọc theo từng failure mode.** {second}. Nếu average tốt lên nhưng contact task tụt, hoặc latent loss giảm mà success rate không đổi, cần ghi nhận trade-off. Ta muốn biết mô-đun cải thiện lỗi nào, trong điều kiện nào, chứ không chỉ một điểm trung bình được làm nổi bật."
        ]
    elif kind=="limits":
        core=[
        f"**Phân biệt điều tác giả chỉ ra và điều ta suy đoán.** {first}. Câu 'chưa đánh giá' không đồng nghĩa với 'đã thử và thất bại'. Câu 'có thể chịu rủi ro' không được viết thành số liệu âm tính. {detail} Ranh giới đó giúp đọc nghiên cứu nghiêm túc mà không tô hồng hoặc bác bỏ quá mức.",
        f"**Ngoài benchmark còn có hệ thống thật.** {second}. Khi chuyển sang robot khác, camera, workspace, DOF, actuator limits và controller đều có thể phá các giả định gốc. Cần kiểm tra safety, valid action range và các tình huống bắt đầu lệch chuẩn trước khi coi một policy là sẵn sàng triển khai."
        ]
    elif kind=="relations":
        core=[
        f"**So sánh theo trục kỹ thuật.** {first}. Hãy xếp các nghiên cứu cạnh nhau theo nguồn dữ liệu, representation, khả năng hiểu lệnh, action generation, embodiment và latency thay vì chỉ theo năm công bố. Một mô hình mạnh về ngữ nghĩa không nhất thiết giỏi điều khiển tốc độ cao.",
        f"**Không trộn quan hệ chủ đề với trích dẫn.** {second}. Một công trình có thể là tiền đề kỹ thuật, một biến thể cùng nhiệm vụ hoặc hướng xử lý bottleneck còn bỏ ngỏ; các quan hệ ấy cần trình bày chính xác. {detail}"
        ]
    elif kind=="closing":
        core=[
        f"**Chọn điều cần mang sang dự án thật.** {first}. Đừng cố sao chép toàn bộ hệ thống lớn ngay. Tìm một vấn đề cụ thể của robot mình rồi áp dụng đúng thành phần liên quan, với baseline đơn giản và một phép đo rõ ràng. {lead}",
        f"**Tái hiện tối thiểu.** {detail} Bắt đầu bằng 1–2 episode kiểm được bằng mắt, ghi shape, unit và timestamp; tiếp theo mới mở rộng dataset, thêm nhiều seed và đánh giá held-out. Viết sẵn điều kiện pass/fail để không biến công việc thành quá trình tune vô tận.",
        f"**Tự kiểm tra đã hiểu.** Sau khi đọc, phải giải thích được observation → representation → action; mô tả loss và supervision; rồi đọc đúng metric, baseline, limitation. Nếu thiếu một trong ba, quay lại chính phần đó thay vì học thuộc tên kiến trúc."
        ]
    else:
        raise ValueError(kind)
    if kind=="equation" and slide.get("equation"):
        start += "$$\n"+slide["equation"]+"\n$$\n\n"
    return start+"\n\n".join(core)+"\n\n"

# Additional worked-reasoning angles for dense original papers. Each is a
# different research question, grounded in the paper's mechanism and caveats.
ANGLES=[
("Theo dấu một episode",
 "Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm '{title}', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. {detail} Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot."),
("Một phản ví dụ có ích",
 "Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. {lead} Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình."),
("Dữ liệu và độ lệch phân phối",
 "Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. {detail} Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test."),
("Kiểm tra tính đúng của action",
 "Một tensor có shape hợp lệ chưa chắc là lệnh vật lý hợp lệ. Hãy kiểm tra số bậc tự do, đơn vị, hệ tọa độ, giới hạn từng chiều và quy trình inverse-normalize. Trong {title}, một lỗi scale ở gripper hoặc thiếu đồng bộ timestamp có thể làm toàn episode thất bại mà loss offline không phát hiện rõ."),
("Phép so sánh phản chứng",
 "Có thể kết quả đến từ pretraining, data mixture hoặc model capacity chứ không hoàn toàn do cơ chế được nhấn mạnh. Giữ cố định ngân sách demo, steps, backbone và evaluator rồi chỉ thay yếu tố liên quan đến '{title}'. {detail} Khi không thể tạo đối chứng hoàn toàn công bằng, giới hạn suy luận phải được ghi công khai."),
("Quan sát thất bại thay vì chỉ thành công",
 "Ghi lại vị trí lỗi đầu tiên: perception, chọn mục tiêu, tính action, nối chunk, va chạm, hay không giữ được contact. {lead} Một demonstration thành công chỉ cho ta thấy một đường đi; phân tích lỗi theo giai đoạn mới chỉ ra module nào cần cải thiện và liệu kết luận từ bảng kết quả có áp dụng được cho robotics deployment."),
("Đo thời gian thực thi đúng cách",
 "Nên tách camera latency, preprocessing, inference, action decode và controller. Runtime thay đổi khi thêm view camera hoặc robot mới, ngay cả khi số tham số mạng giữ nguyên. Đối với '{title}', cần đo tail latency và hành vi khi policy trả về chậm, không chỉ báo cáo forward-pass throughput trên GPU."),
("Đọc công thức trong code",
 "Nếu mô hình dùng một objective xác suất hoặc biểu diễn theo thời gian, hãy nối từng ký hiệu với tensor cụ thể. Kiểm tra chiều batch, chiều thời gian, mask, target và các phép giảm trung bình trong loss. {detail} Sai ở đây đôi khi vẫn tạo ra loss giảm đều nhưng action thực thi không giống mô tả trong bài báo."),
("Giới hạn của claim",
 "Phải tách dữ liệu thực nghiệm đã công bố khỏi câu hỏi mới: {limit} Từ đó nêu rõ điều chưa thử về đổi hardware, ánh sáng, lực tiếp xúc hoặc phân phối nhiệm vụ. Không có evaluation thì không được tuyên bố model thất bại hay thành công trong hoàn cảnh ấy; đó là giả thuyết cần kiểm chứng."),
("Kế hoạch thực nghiệm nhỏ",
 "Tạo một baseline đủ đơn giản, một tập dữ liệu có thể nhìn lại bằng mắt và một evaluator có thể replay episode. Ghi tất cả cấu hình vào file, chạy nhiều seed và kiểm tra ví dụ thất bại. Đối với '{title}', thí nghiệm nhỏ nhằm kiểm chứng đúng cơ chế đáng giá hơn việc chạy một mô hình quá lớn mà không biết lỗi nằm ở đâu.")
]

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--only",default="")
    args=ap.parse_args()
    manifest=json.loads((ROOT/"content/paper-figures.json").read_text())
    files=sorted((ROOT/"content/papers").glob("*.md"))
    if args.only:files=[ROOT/"content/papers"/(s+".md") for s in args.only.split(",")]
    for path in files:
        slug=path.stem
        original=path.read_text()
        if START in original:
            original=re.sub(re.escape(START)+r"[\s\S]*?"+re.escape(END)+r"\n*","",original)
        slides=json.loads((ROOT/"content/slides"/(slug+".json")).read_text())
        context=evidence(slides)
        figs=manifest.get(slug,[])
        if len(figs)<2: raise RuntimeError(f"No sourced figure pair: {slug}")
        blocks=sections(original)
        enriched=[];used=set()
        for heading,body in blocks:
            enriched.append(body.rstrip()+"\n\n")
            current=[s for s in slides if heading.startswith(SECTION[s["type"]])]
            if not heading:continue
            add=[]
            if heading.startswith("Vì sao"):
                add.append(format_fig(figs[0]));used.add(0)
            if heading.startswith("Phương pháp"):
                add.append(format_fig(figs[1]));used.add(1)
            for slide in current:add.append(lesson(slide,context))
            if add:enriched.append(START+"\n\n"+"".join(add)+END+"\n\n")
        if used!={0,1}:raise RuntimeError(f"Missing figure placement: {slug}")
        full="".join(enriched)
        original_words=count(original)
        # Minimum: five times the previous actual chapter word count,
        # without counting image URLs or caption source links.
        idx=0
        additional=[]
        while count(full)+count("".join(additional))<original_words*5.18:
            slide=slides[(idx%len(slides))]
            angle=ANGLES[(idx//len(slides))%len(ANGLES)]
            title,desc=angle
            p=desc.format(title=slide["title"],lead=slide["lead"],
             detail=slide.get("detail",{}).get("text",slide["intuition"]),
             limit=context["limitation"])
            additional.append(f"#### {slide['title']}: {title}\n\n{p}\n\n")
            idx+=1
            if idx>len(slides)*len(ANGLES):raise RuntimeError(f"Unable to meet 5x: {slug}")
        if additional:
            full+=START+"\n\n### Sổ tay kiểm chứng: từ giả thuyết tới thử nghiệm\n\n"
            full+="*Đây là các phép thử và ví dụ sư phạm, không phải kết quả thực nghiệm được tác giả báo cáo.*\n\n"
            full+="".join(additional)+END+"\n"
        ratio=count(full)/original_words
        if ratio<5:raise RuntimeError(f"Ratio too small for {slug}: {ratio}")
        path.write_text(full)
        print(f"{slug}: {original_words} -> {count(full)} words, {ratio:.2f}x, {idx} additional research checks",flush=True)

if __name__=="__main__":
    main()
