package BoardMate.UploadDocument;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api/pdf")
public class PdfController {

    private final Path pdfDir = Paths.get(System.getProperty("user.dir"))
            .getParent()
            .resolve("Camera")
            .resolve("SavedPDF");

    // 你原来的接口保留不变
    @GetMapping(value = "/latest", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<Resource> getLatestPdf() {
        FileSystemResource resource = new FileSystemResource(pdfDir.resolve("output.pdf").toFile());
        if (!resource.exists()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).body(resource);
    }

    // 新增：列出所有PDF
    @GetMapping("/list")
    public List<Map<String, Object>> listPDFs() {
        File dir = pdfDir.toFile();
        List<Map<String, Object>> result = new ArrayList<>();
        if (!dir.exists()) return result;

        File[] files = dir.listFiles((d, name) -> name.endsWith(".pdf"));
        if (files == null) return result;

        for (int i = 0; i < files.length; i++) {
            File f = files[i];
            Map<String, Object> doc = new HashMap<>();
            doc.put("id", String.valueOf(i));
            doc.put("name", f.getName());
            doc.put("url", "/api/pdf/file/" + f.getName());
            doc.put("date", new Date(f.lastModified()));
            doc.put("pages", 1);
            result.add(doc);
        }
        return result;
    }

    // 新增：按文件名获取PDF
    @GetMapping(value = "/file/{filename}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<Resource> getPDF(@PathVariable String filename) {
        FileSystemResource resource = new FileSystemResource(pdfDir.resolve(filename).toFile());
        if (!resource.exists()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).body(resource);
    }

    // 新增：删除PDF
    @DeleteMapping("/file/{filename}")
    public ResponseEntity<Void> deletePDF(@PathVariable String filename) {
        pdfDir.resolve(filename).toFile().delete();
        return ResponseEntity.ok().build();
    }
}