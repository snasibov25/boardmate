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
@CrossOrigin(originPatterns = "*")
public class PdfController {

    private final Path pdfDir = Paths.get(System.getProperty("user.dir"))
            .getParent()
            .resolve("Camera")
            .resolve("SavedPDF");

    @GetMapping(value = "/latest", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<Resource> getLatestPdf() {
        FileSystemResource resource = new FileSystemResource(pdfDir.resolve("output.pdf").toFile());
        if (!resource.exists()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).body(resource);
    }

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
            doc.put("id", f.getName()); 
            doc.put("name", f.getName());
            doc.put("url", "/api/pdf/file/" + f.getName());
            doc.put("date", new Date(f.lastModified()));
            doc.put("pages", 1);
            result.add(doc);
        }
        return result;
    }

    @GetMapping(value = "/file/{filename}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<Resource> getPDF(@PathVariable String filename) {
        if (filename.contains("..") || filename.contains("/")) {
            return ResponseEntity.badRequest().build();
        }
        FileSystemResource resource = new FileSystemResource(pdfDir.resolve(filename).toFile());
        if (!resource.exists()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).body(resource);
    }

    @DeleteMapping("/file/{filename}")
    public ResponseEntity<Void> deletePDF(@PathVariable String filename) {
        if (filename.contains("..") || filename.contains("/")) {
            return ResponseEntity.badRequest().build();
        }
        boolean deleted = pdfDir.resolve(filename).toFile().delete();
        if (!deleted) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().build();
    }
}